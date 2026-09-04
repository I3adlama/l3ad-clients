import "server-only";
import { MODELS, callStructured, withManagerFallback, describeError } from "./client";
import {
  ProposalPlanSchema,
  ProposalStorySchema,
  ProposalNumbersSchema,
  ProposalCloseSchema,
  ProposalReviewSchema,
  type ProposalPlan,
  type ProposalReview,
} from "./schemas";
import { deepScrub, todayLine } from "./text";

// ============================================================================
// PROPOSAL GENERATION PIPELINE
// Opus 5 plan -> Sonnet 5 full deck (structured) -> Sonnet 5 review + typed corrections
// ============================================================================

export interface ProposalProjectContext {
  id: string;
  client_name: string;
  business_type: string | null;
  location: string | null;
  social_urls: { platform: string; url: string }[] | null;
  ai_analysis: Record<string, unknown> | null;
  intake_responses: { section_key: string; responses: Record<string, unknown> }[];
}

const L3AD_PRICING = `SERVICES & PRICING (use these real prices):
- SEO: Starter $350/mo, Growth $700/mo
- Web Design: Starter $1,500, Business $3,000 (one-time)
- Digital Advertising: Starter $400/mo + ad spend, Growth $750/mo + ad spend
- Google Business Profile: Setup $250 one-time, Starter $150/mo, Growth $300/mo
- Social Media: Starter $350/mo (2 platforms), Growth $650/mo (3 platforms)
- AI Automation: Starter $350 setup + $75/mo, Growth $750 setup + $150/mo
- AI Search (GEO): Starter $350/mo, Growth $650/mo

BUNDLES:
- Get Found: $450/mo (SEO Starter + GBP Starter) + $250 GBP setup, saves $50/mo
- Get Growing: $1,200/mo (SEO Growth + GBP Growth + Social Starter) + $250 GBP setup, saves $150/mo

CUSTOM INTEGRATIONS:
- Booking/Calendar Integration: $150 one-time setup + $20/mo (appointment scheduling, calendar sync)
- Payment Gateway Integration: $150 one-time setup + $20/mo (invoicing, payment processing)

AUDITS:
- SEO Audit: $49, GBP Audit: $39, GEO Audit: $99`;

export const BRAND_VOICE_RULES = `
WRITING VOICE (MANDATORY):
- No em dashes or en dashes anywhere. Use commas, periods, parentheses, or colons.
- No AI words: leverage, actionable, seamless, comprehensive, dive into, delve, landscape, elevate, robust, streamline, game-changing, cutting-edge, unlock, empower, revolutionize, holistic, synergy, tailored, bespoke
- No jargon clients wouldn't say out loud: lead generation, conversion-focused, omnichannel, KPIs
- No exclamation points
- No fake guarantees: guaranteed rankings, dominate Google, crush the competition
- Write how a real person talks. Contractions preferred.
- Direct, honest, peer-to-peer. Confident without being arrogant.
- Short paragraphs. Lead with the point.
- If a sentence sounds like a consultant wrote it, rewrite it.
- FIRST PERSON SINGULAR ONLY: L3ad Solutions is a solo founder (Nathaniel). Use "I", "I'm", "my", "me" instead of "we", "we're", "our", "us". Never use plural pronouns when referring to L3ad Solutions.`;

function buildProjectSummary(project: ProposalProjectContext): string {
  const parts: string[] = [];
  parts.push(`Client: ${project.client_name}`);
  if (project.business_type) parts.push(`Type: ${project.business_type}`);
  if (project.location) parts.push(`Location: ${project.location}`);

  if (project.ai_analysis) {
    const ai = project.ai_analysis;
    if (ai.description) parts.push(`Description: ${String(ai.description).slice(0, 300)}`);
    if (ai.services) parts.push(`Services: ${JSON.stringify(ai.services).slice(0, 300)}`);
    if (ai.strengths) parts.push(`Strengths: ${JSON.stringify(ai.strengths).slice(0, 300)}`);
    if (ai.market) parts.push(`Market research: ${JSON.stringify(ai.market).slice(0, 800)}`);
    if (ai.tone) parts.push(`Tone: ${String(ai.tone)}`);
  }

  return parts.join("\n").slice(0, 3000);
}

function buildFullContext(project: ProposalProjectContext | null, notes: string): string {
  const parts: string[] = [];
  parts.push(`ADMIN NOTES:\n${notes}`);

  if (!project) return parts.join("\n\n");

  parts.push(`CLIENT: ${project.client_name}`);
  if (project.business_type) parts.push(`BUSINESS TYPE: ${project.business_type}`);
  if (project.location) parts.push(`LOCATION: ${project.location}`);

  if (project.social_urls && project.social_urls.length > 0) {
    parts.push(`SOCIAL URLS:\n${project.social_urls.map((s) => `- ${s.platform}: ${s.url}`).join("\n")}`);
  }

  if (project.ai_analysis) {
    const { _meta, discovered_social_urls, suggested_questions, ...rest } = project.ai_analysis as Record<string, unknown> & {
      _meta?: unknown;
      discovered_social_urls?: unknown;
      suggested_questions?: unknown;
    };
    void _meta;
    void discovered_social_urls;
    void suggested_questions;
    parts.push(`AI ANALYSIS:\n${JSON.stringify(rest, null, 2).slice(0, 8000)}`);
  }

  if (project.intake_responses.length > 0) {
    const intakeText = project.intake_responses
      .map((r) => `[${r.section_key}]: ${JSON.stringify(r.responses)}`)
      .join("\n");
    parts.push(`INTAKE RESPONSES:\n${intakeText.slice(0, 6000)}`);
  }

  return parts.join("\n\n");
}

/** Apply reviewer corrections to leaf string/number fields only; never change structure. */
function applyProposalCorrections(data: Record<string, unknown>, review: ProposalReview): Record<string, unknown> {
  const result = JSON.parse(JSON.stringify(data));

  for (const c of review.corrections) {
    const keys = c.path.split(".");
    let obj: unknown = result;
    for (let i = 0; i < keys.length - 1; i++) {
      if (obj && typeof obj === "object" && keys[i] in (obj as object)) {
        obj = (obj as Record<string, unknown>)[keys[i]];
      } else {
        obj = null;
        break;
      }
    }
    if (!obj || typeof obj !== "object") {
      console.warn(`[proposal] Skipping correction at ${c.path}: path not found`);
      continue;
    }

    const lastKey = keys[keys.length - 1];
    const current = (obj as Record<string, unknown>)[lastKey];

    if (typeof current === "string") {
      (obj as Record<string, unknown>)[lastKey] = c.fix;
    } else if (typeof current === "number") {
      const n = Number(c.fix);
      if (Number.isFinite(n)) (obj as Record<string, unknown>)[lastKey] = n;
    } else if (typeof current === "boolean") {
      (obj as Record<string, unknown>)[lastKey] = /^(true|yes)$/i.test(c.fix.trim());
    } else {
      console.warn(`[proposal] Skipping correction at ${c.path}: only leaf values can be corrected`);
    }
  }

  return result;
}

export async function generateProposal(
  notes: string,
  project: ProposalProjectContext | null
): Promise<{ proposalData: Record<string, unknown>; clientName: string; industry: string | null }> {
  const clientName = project?.client_name || "Prospective Client";
  const industry = project?.business_type || null;

  const now = new Date();
  const currentDate = now.toLocaleString("en-US", { month: "long", year: "numeric" });
  const dateLine = todayLine();

  // STEP 1: Opus 5 strategic plan
  console.log("[proposal] Step 1: strategic planning...");
  const projectSummary = project ? buildProjectSummary(project) : "No linked project. Use the admin notes only.";

  let plan: ProposalPlan;
  try {
    const { result } = await withManagerFallback("proposal plan", (model) =>
      callStructured({
        label: "proposal plan",
        model,
        maxTokens: 6000,
        effort: "medium",
        schema: ProposalPlanSchema,
        prompt: `You are the strategist at L3ad Solutions, a solo-founder web design and digital marketing agency run by Nathaniel. Plan a proposal for a potential client. Always use first person singular for L3ad (I/my/me, never we/our/us).

${dateLine}

CLIENT CONTEXT:
${projectSummary}

ADMIN'S PROPOSAL NOTES:
${notes}

${L3AD_PRICING}

Create the strategic proposal plan. Be specific to THIS client's industry and situation. Pick services that actually match their needs; do not recommend everything.`,
      })
    );
    plan = result;
  } catch (e) {
    throw new Error(`Step 1 (plan) failed: ${describeError(e)}`);
  }

  // STEP 2: Sonnet 5 deck in three schema-constrained parts (story + numbers in parallel, then the close)
  console.log("[proposal] Step 2: generating proposal deck...");
  const fullContext = buildFullContext(project, notes);

  const deckContext = `${dateLine}
${BRAND_VOICE_RULES}

STRATEGIC PLAN FROM SENIOR STRATEGIST:
${JSON.stringify(plan, null, 2)}

FULL CLIENT CONTEXT:
${fullContext}

${L3AD_PRICING}

GLOBAL RULES:
- All prices as "$X,XXX" strings. Keep each description to one or two sentences.
- Be specific to THIS client throughout. Never invent a business name, a statistic, or a price.`;

  let proposalData: Record<string, unknown>;
  try {
    const [story, numbers] = await Promise.all([
      callStructured({
        label: "proposal story",
        model: MODELS.balanced,
        maxTokens: 12000,
        effort: "medium",
        timeoutMs: 240_000,
        schema: ProposalStorySchema,
        prompt: `Write slides 1-4 of a 10-slide L3ad Solutions proposal (title, pain points, why a new website, AIDA strategy).

${deckContext}

RULES:
1. title.date = "${currentDate}", title.client_name = "${clientName}", subtitle is a short tagline.
2. pain_points: exactly 6 items, Bootstrap Icons (bi-*), specific to this client's industry.
3. pain_points_heading: custom heading for this client (not generic). pain_points_subheading: one honest sentence about their situation.
4. why_new_website: exactly 10 before + 10 after items.
5. aida_strategy: 4 sections, 3-5 items each.`,
      }),
      callStructured({
        label: "proposal numbers",
        model: MODELS.balanced,
        maxTokens: 12000,
        effort: "medium",
        timeoutMs: 240_000,
        schema: ProposalNumbersSchema,
        prompt: `Write slides 5-7 of a 10-slide L3ad Solutions proposal (itemized pricing, competitors, ROI).

${deckContext}

RULES:
1. itemized_pricing: use prices from the admin's notes if custom pricing was specified, otherwise L3ad catalog prices. Group by category with subtotals.
2. competitors: 3-4 real competitors in their local market, taken from the market research in the client context when present. Honest assessments. If no research is available, use only competitors the admin named; never invent one.
3. roi: industry-specific revenue estimates. cost_breakdown lists each service cost. revenue_model explains the math. projections show 6 months. callout has 2-3 plain-language lines about payoff. Numbers must be internally consistent (monthly_revenue = revenue_per_customer x new_customers_per_month; annual_revenue = monthly_revenue x 12).`,
      }),
    ]);

    const close = await callStructured({
      label: "proposal close",
      model: MODELS.balanced,
      maxTokens: 10000,
      effort: "medium",
      timeoutMs: 240_000,
      schema: ProposalCloseSchema,
      prompt: `Write slides 8-10 of a 10-slide L3ad Solutions proposal (timeline, pricing summary, next steps).

${deckContext}

PRICING ALREADY SET IN SLIDE 5 (the summary must match these numbers exactly):
${JSON.stringify(numbers.itemized_pricing, null, 2)}

RULES:
1. timeline: L3ad builds sites in 1-2 days. Discovery is 1-3 days. GBP/citations take 24-48 hours (up to 3 weeks for propagation). SEO launch is 1-2 weeks. Total: 1-2 weeks to go live, then ongoing monthly work.
2. pricing_summary: 1-3 packages as a clean comparison. original_price is the standard rate, price is what they pay, savings is the difference. price and original_price are bare amounts like "$470" with no "/mo"; the frequency field alone carries "/mo" or "one-time". Mark the recommended option highlighted.
3. next_steps: 3-5 steps. cta_text should be contextual (not "Get Started Today"). cta_url = "https://l3adsolutions.com".
4. personal_note: genuine, written like a real person, referencing the client's specific situation.`,
    });

    proposalData = { ...story, ...numbers, ...close } as unknown as Record<string, unknown>;
  } catch (e) {
    throw new Error(`Step 2 (deck) failed: ${describeError(e)}`);
  }

  // STEP 3: Sonnet 5 review with leaf-level corrections (non-fatal)
  console.log("[proposal] Step 3: reviewing proposal...");
  try {
    const review = await callStructured({
      label: "proposal review",
      model: MODELS.balanced,
      maxTokens: 6000,
      effort: "low",
      schema: ProposalReviewSchema,
      prompt: `You are doing final quality control on a generated L3ad Solutions proposal before it goes to the admin.

${dateLine}
CLIENT: ${clientName}
INDUSTRY: ${industry || "Unknown"}
EXPECTED DATE: ${currentDate}

PROPOSAL:
${JSON.stringify(proposalData, null, 2).slice(0, 12000)}

REAL PRICING CATALOG:
${L3AD_PRICING}

CHECK:
1. All prices are real L3ad Solutions prices from the catalog or the admin's custom pricing.
2. ROI math is internally consistent.
3. Pain points are specific to the client's industry.
4. Timeline matches the recommended services.
5. Competitor entries are plausible and not invented.
6. title.date is "${currentDate}" and title.client_name is "${clientName}".
7. Copy uses first person singular for L3ad and contains no em dashes.

Return corrections only for leaf string or number fields, each with the exact replacement value. Leave everything else alone.`,
    });

    if (review.corrections.length > 0) {
      proposalData = applyProposalCorrections(proposalData, review);
    }
  } catch (e) {
    console.warn(`[proposal] Step 3 (review) failed, using unreviewed draft: ${describeError(e)}`);
  }

  console.log("[proposal] Pipeline complete.");
  return { proposalData: deepScrub(proposalData), clientName, industry };
}
