import "server-only";
import { MODELS, callStructured, callWithWebSearch, withManagerFallback, describeError, type ModelId } from "./ai/client";
import {
  crawlSite,
  fetchLinkedPages,
  pageHasContent,
  renderPagesContext,
  renderPagesSummary,
  sourcesSummary,
  type CrawledPage,
  type DiscoveredLink,
  type PageStatus,
} from "./ai/crawl";
import {
  PlanSchema,
  ExtractionSchema,
  CoreAnalysisSchema,
  GuidanceSchema,
  ApprovalSchema,
  type Plan,
  type Extraction,
  type AnalysisDraft,
  type Approval,
  type Market,
} from "./ai/schemas";
import { deepScrub, pruneEmpty, sameText, todayLine } from "./ai/text";

export { generateProposal, type ProposalProjectContext } from "./ai/proposal";

// ============================================================================
// PUBLIC TYPES (persisted as projects.ai_analysis)
// ============================================================================

export interface SuggestedQuestion {
  section: string;
  question: string;
  why: string;
}

export interface PrefillData {
  your_story: {
    how_started?: string;
    years_in_business?: string;
    differentiator?: string;
  };
  services: {
    main_services?: string[];
    specialty?: string;
    service_area?: string;
  };
  your_customers: {
    ideal_customer?: string;
    how_they_find_you?: string[];
  };
  content_media?: {
    has_existing_website?: boolean;
    existing_website_url?: string;
  };
  goals?: {
    competitor_url?: string;
  };
}

export interface AnalysisSource {
  label: string;
  url: string;
  status: PageStatus;
  note: string;
}

export interface AnalysisMeta {
  models_used: string[];
  pages_fetched: number;
  pages_with_content: number;
  follow_up_performed: boolean;
  research_performed: boolean;
  research_searches: number;
  quality_score: string;
  approved: boolean;
  approval_notes: string;
  /** Raw web research notes (truncated) so the admin can see what the model actually found. */
  research_notes?: string;
  sources: AnalysisSource[];
  analyzed_at: string;
  duration_seconds: number;
}

export interface BusinessAnalysis {
  business_name: string;
  business_type: string;
  location: string;
  founded?: string;
  services: string[];
  team?: { name: string; role: string }[];
  locations?: { name: string; address: string; phone: string }[];
  description: string;
  tone: string;
  branding_clues: string[];
  review_highlights: string[];
  strengths: string[];
  market?: Market;
  suggested_questions: SuggestedQuestion[];
  prefill: PrefillData;
  discovered_social_urls?: DiscoveredLink[];
  _meta: AnalysisMeta;
}

// ============================================================================
// SHARED PROMPT PIECES
// ============================================================================

const AGENCY_CONTEXT = `L3ad Solutions is a Florida web design and digital marketing agency run by one person, Nathaniel. He builds websites that get local businesses more customers.`;

const ANALYSIS_VOICE = `WRITING RULES (mandatory):
- No em dashes or en dashes anywhere. Use commas, periods, colons or parentheses.
- Plain language. No marketing filler (leverage, seamless, comprehensive, elevate, robust, holistic, cutting-edge).
- Never invent facts. If something is not in the evidence, leave it out or say it was not found.
- "prefill" text is shown to the client as a suggested answer to their own intake form, so write it the way the owner would say it about their own business ("We've served Titusville since 2004..."). Keep each prefill answer to 1-3 sentences.
- "suggested_questions" are questions Nathaniel will ask the client in person, so write them in his voice: first person singular (I, my), conversational, specific to this business.
- "description" is for Nathaniel's eyes: third person, factual, 1-2 sentences.
- business_type is a short label of at most eight words, e.g. "independent optometry practice with optical shop".
- Never put notes, caveats or instructions for Nathaniel inside prefill text or services; the client reads those fields. Put open questions in suggested_questions instead.`;

// ============================================================================
// STEP 1: OPUS 5 (Manager) - identify the business and draft the extraction plan
// ============================================================================

async function draftPlan(input: {
  sourceUrl: string | null;
  notes: string;
  hints: { name: string; type: string; location: string };
  pages: CrawledPage[];
  discoveredLinks: DiscoveredLink[];
}): Promise<{ plan: Plan; model: ModelId }> {
  const linksText =
    input.discoveredLinks.length > 0
      ? `LINKS FOUND ON THE SITE:\n${input.discoveredLinks.map((l) => `- ${l.platform}: ${l.url}`).join("\n")}`
      : "No social or directory links were found on the site.";

  const known = [
    input.hints.name ? `KNOWN NAME: ${input.hints.name}` : "",
    input.hints.type ? `KNOWN TYPE: ${input.hints.type}` : "",
    input.hints.location ? `KNOWN LOCATION: ${input.hints.location}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const { result, model } = await withManagerFallback("plan", (model) =>
    callStructured({
      label: "plan",
      model,
      maxTokens: 6000,
      effort: "low",
      schema: PlanSchema,
      prompt: `You are the senior strategist at L3ad Solutions. ${AGENCY_CONTEXT}
A potential client's online presence was just crawled. Identify the business and tell the extraction team exactly what to look for.

${todayLine()}
${input.sourceUrl ? `SOURCE URL: ${input.sourceUrl}` : ""}
${known}
${input.notes ? `ADMIN NOTES: ${input.notes}` : ""}
${linksText}

PAGE PREVIEWS (first 1500 characters of each page we could read):
${renderPagesSummary(input.pages)}

Think like a strategist, not a data entry clerk. What matters for building THIS client a website that gets them customers? Name the business exactly as the site does (never a domain slug). Give the primary city and state.`,
    })
  );

  return { plan: result, model };
}

// ============================================================================
// STEP 2a: HAIKU 4.5 (Worker) - targeted extraction following the plan
// ============================================================================

async function extractFacts(input: {
  clientName: string;
  location: string;
  pagesContext: string;
  plan: Plan;
}): Promise<Extraction> {
  return callStructured({
    label: "extract",
    model: MODELS.fast,
    maxTokens: 8000,
    schema: ExtractionSchema,
    prompt: `Extract business data from these web pages following the senior strategist's plan.

${todayLine()}
CLIENT: ${input.clientName} | TYPE: ${input.plan.business_category} | LOCATION: ${input.location || "Unknown"}

STRATEGIST'S EXTRACTION PLAN:
Focus on: ${input.plan.extraction_focus.join(", ")}
Specifically look for: ${input.plan.look_for.join(", ")}
Key questions to answer: ${input.plan.key_questions.join(", ")}

PAGES (pages marked failed or skipped had no readable content; do not guess what they contain):
${input.pagesContext}

Extract everything the plan asks for. Only record what the pages actually say. Put customer quotes in review_highlights only when they are real quotes or clearly stated themes; if there are none, leave it empty. List every named person with their role, every physical location, and every service or product line the site itself names.`,
  });
}

// ============================================================================
// STEP 2b: OPUS 5 + web search - reviews, reputation, local competitors
// ============================================================================

async function researchMarket(input: {
  clientName: string;
  category: string;
  location: string;
  sourceUrl: string | null;
  notes: string;
}): Promise<{ notes: string; searches: number; model: ModelId }> {
  const { result, model } = await withManagerFallback("research", (model) =>
    callWithWebSearch({
      label: "research",
      model,
      maxTokens: 8000,
      effort: "low",
      maxSearches: 8,
      timeoutMs: 120_000,
      prompt: `You are researching a potential client for L3ad Solutions. ${AGENCY_CONTEXT}

${todayLine()}
BUSINESS: ${input.clientName}
CATEGORY: ${input.category}
LOCATION: ${input.location || "unknown"}
${input.sourceUrl ? `WEBSITE: ${input.sourceUrl}` : ""}
${input.notes ? `ADMIN NOTES: ${input.notes}` : ""}

Use web search to find, in this order:
1. Their Google Business Profile rating and review count (try "${input.clientName} ${input.location} reviews"). Also Yelp, Facebook or Healthgrades ratings if they surface.
2. Four to six short real customer review snippets and the recurring themes, both praise and complaints.
3. The three to five most visible local competitors for "${input.category} ${input.location}": business name, website, and rating with review count when shown.
4. Anything notable: news, awards, ownership changes, additional locations, related brands, and whether a second location or sister brand is a separate business.

Run each search once with a distinct query; a Yelp, Facebook, Healthgrades or directory rating counts when Google's is not shown.
Write plain text notes under the headings REVIEWS, COMPETITORS, NOTABLE, SOURCES (list every URL you relied on). Quote numbers exactly as the source shows them and say "not found" where you could not find something. Never invent a rating, a count, or a business name. Keep it under 500 words.`,
    })
  );
  return { notes: result.text, searches: result.searches, model };
}

// ============================================================================
// STEP 2c: HAIKU 4.5 follow-up when the first pass was thin
// ============================================================================

async function followUpExtraction(input: {
  gaps: string[];
  pagesContext: string;
  extraction: Extraction;
}): Promise<string> {
  const result = await callStructured({
    label: "follow-up",
    model: MODELS.fast,
    maxTokens: 4000,
    schema: ExtractionSchema.pick({ raw_facts: true, services: true, data_gaps: true }),
    prompt: `The senior strategist reviewed your extraction and found gaps. Re-read the pages and dig deeper.

${todayLine()}
GAPS TO FILL: ${input.gaps.join("; ")}

WHAT YOU ALREADY FOUND:
${JSON.stringify({ services: input.extraction.services, raw_facts: input.extraction.raw_facts }, null, 2)}

PAGES (re-read carefully):
${input.pagesContext}

Return only NEW facts and services not already listed, and the gaps that still cannot be filled.`,
  });

  if (result.raw_facts.length === 0 && result.services.length === 0) return "";
  return [
    result.raw_facts.length ? `Additional facts:\n- ${result.raw_facts.join("\n- ")}` : "",
    result.services.length ? `Additional services:\n- ${result.services.join("\n- ")}` : "",
    result.data_gaps.length ? `Still missing: ${result.data_gaps.join("; ")}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

// ============================================================================
// STEP 3: SONNET 5 (Analyst) - polished analysis, questions and prefill
// ============================================================================

async function generateAnalysis(input: {
  clientName: string;
  location: string;
  extraction: Extraction;
  plan: Plan;
  followUp: string;
  research: string;
}): Promise<AnalysisDraft> {
  const shared = `${AGENCY_CONTEXT}
The senior strategist reviewed the raw data and set the direction below.

${todayLine()}
CLIENT: ${input.clientName} | TYPE: ${input.plan.business_category} | LOCATION: ${input.location || input.extraction.location}

STRATEGIST'S POSITIONING NOTES:
${input.plan.strategy_notes}

RED FLAGS TO ADDRESS:
${input.plan.red_flags.length > 0 ? input.plan.red_flags.join("; ") : "None identified"}

RAW EXTRACTION FROM THEIR WEBSITE AND PROFILES:
${JSON.stringify(input.extraction, null, 2)}
${input.followUp ? `
FOLLOW-UP FINDINGS:
${input.followUp}` : ""}

WEB RESEARCH NOTES (reviews, reputation, competitors; may say "not found"):
${input.research || "No web research available."}

${ANALYSIS_VOICE}`;

  // Two smaller structured calls in parallel: the API rejects one schema this large.
  const [core, guidance] = await Promise.all([
    callStructured({
      label: "generate core",
      model: MODELS.balanced,
      maxTokens: 12000,
      effort: "medium",
      schema: CoreAnalysisSchema,
      prompt: `Produce the business profile part of the client analysis for L3ad Solutions. ${shared}

FIELD RULES:
- business_name, business_type, location, founded, services, team, locations: carry over from the extraction, corrected only where the evidence clearly says otherwise. Do not add services that are not in the evidence.
- description: 1-2 factual sentences for Nathaniel, third person, using the positioning notes.
- review_highlights: real quotes or themes from the research notes or the site. Empty if none.
- strengths: evidence only, not assumptions.
- market: fill from the research notes only. google_rating and review_count refer to Google; if only Yelp or Facebook ratings were found, leave those two empty and put the platform ratings in review_themes (e.g. "Yelp: 4.5 stars from 16 reviews"). Competitors must be real businesses named in the research; copy their URLs and ratings exactly. notable must contain only facts the research or the site states, never inferences.`,
    }),
    callStructured({
      label: "generate guidance",
      model: MODELS.balanced,
      maxTokens: 12000,
      effort: "medium",
      schema: GuidanceSchema,
      prompt: `Produce the intake guidance part of the client analysis for L3ad Solutions. ${shared}

FIELD RULES:
- suggested_questions: 5-8 questions across different sections. Start from the strategist's key questions: ${input.plan.key_questions.join("; ")}. Probe the data gaps: ${input.extraction.data_gaps.join("; ") || "none"}. Include at least one your_brand question about visual direction (light or dark, vibe). Every question must reference something specific about this business.
- prefill: only fields you are confident about from the evidence. Wrong prefill is worse than no prefill; use null when unsure. services.main_services must be a subset of the extracted services. goals.competitor_url only if a specific competitor site was named.`,
    }),
  ]);

  return { ...core, ...guidance };
}

// ============================================================================
// STEP 4: OPUS 5 (Manager) - review and typed corrections
// ============================================================================

async function reviewAnalysis(input: {
  clientName: string;
  plan: Plan;
  extraction: Extraction;
  research: string;
  draft: AnalysisDraft;
}): Promise<{ approval: Approval; model: ModelId }> {
  const { result, model } = await withManagerFallback("review", (model) =>
    callStructured({
      label: "review",
      model,
      maxTokens: 8000,
      effort: "medium",
      schema: ApprovalSchema,
      prompt: `You are the senior strategist at L3ad Solutions doing final quality control before this analysis goes to Nathaniel, the agency owner.

${todayLine()}
CLIENT: ${input.clientName} (${input.plan.business_category})

YOUR ORIGINAL STRATEGY:
${input.plan.strategy_notes}
Key questions you wanted answered: ${input.plan.key_questions.join("; ")}

RAW FACTS FROM THE SOURCES:
${JSON.stringify({ raw_facts: input.extraction.raw_facts, services: input.extraction.services, team: input.extraction.team, locations: input.extraction.locations }, null, 2)}

WEB RESEARCH NOTES:
${input.research || "No web research available."}

PROPOSED ANALYSIS:
${JSON.stringify(input.draft, null, 2)}

APPROVAL CRITERIA:
- Name, type, location and founding date are accurate.
- The description honestly represents the business with no invented claims.
- Every listed service is confirmed by the sources. Remove any that are not; add confirmed ones the draft missed.
- Strengths are evidence, not assumptions. Do not assert something as a strength and also ask the client whether it is true.
- market.notable and market.competitors contain only what the research or the site states; remove inferences and unverified claims with market_notable_to_remove and competitors_to_remove.
- Prefill text contains no notes or caveats aimed at Nathaniel; fix with prefill_overrides.
- review_highlights contains only real quotes or themes, never explanations of what could not be found.
- Questions are specific and useful. Replace generic ones.
- Prefill is accurate; wrong prefill is worse than no prefill.
- No em dashes anywhere.

Every correction must carry the exact final text, never an instruction or a comment. Approve honest but thin data with notes; reject only if the analysis is misleading. In notes, tell Nathaniel what was found, how good the data is, and what to ask the client directly.`,
    })
  );
  return { approval: result, model };
}

/** Deterministic application of the reviewer's typed corrections. */
function applyApproval(draft: AnalysisDraft, approval: Approval): AnalysisDraft {
  const result: AnalysisDraft = JSON.parse(JSON.stringify(draft));

  for (const c of approval.field_corrections) {
    const value = c.corrected.trim();
    if (!value) continue;
    result[c.field] = value;
  }

  if (approval.services_to_remove.length > 0) {
    result.services = result.services.filter((s) => !approval.services_to_remove.some((r) => sameText(r, s)));
    result.prefill.services.main_services = result.prefill.services.main_services.filter(
      (s) => !approval.services_to_remove.some((r) => sameText(r, s))
    );
  }
  for (const add of approval.services_to_add) {
    if (add.trim() && !result.services.some((s) => sameText(s, add))) result.services.push(add.trim());
  }

  if (approval.strengths_to_remove.length > 0) {
    result.strengths = result.strengths.filter((s) => !approval.strengths_to_remove.some((r) => sameText(r, s)));
  }
  if (approval.review_highlights_to_remove.length > 0) {
    result.review_highlights = result.review_highlights.filter(
      (s) => !approval.review_highlights_to_remove.some((r) => sameText(r, s))
    );
  }
  if (approval.market_notable_to_remove.length > 0) {
    result.market.notable = result.market.notable.filter(
      (s) => !approval.market_notable_to_remove.some((r) => sameText(r, s))
    );
  }
  if (approval.competitors_to_remove.length > 0) {
    result.market.competitors = result.market.competitors.filter(
      (c) => !approval.competitors_to_remove.some((r) => sameText(r, c.name))
    );
  }

  if (approval.questions_to_remove.length > 0 || approval.questions_to_add.length > 0) {
    const toRemove = new Set(approval.questions_to_remove);
    result.suggested_questions = result.suggested_questions.filter((_, i) => !toRemove.has(i));
    result.suggested_questions.push(...approval.questions_to_add);
  }

  for (const o of approval.prefill_overrides) {
    const [section, field] = o.path.split(".") as [keyof AnalysisDraft["prefill"], string];
    const target = result.prefill[section] as Record<string, unknown> | undefined;
    if (!target || !(field in target)) continue;
    if (o.action === "remove") target[field] = null;
    else if (o.value && o.value.trim()) target[field] = o.value.trim();
  }

  return result;
}

// ============================================================================
// CORE PIPELINE
// ============================================================================

interface PipelineInput {
  sourceUrl: string | null;
  notes: string;
  hints: { name: string; type: string; location: string };
  pages: CrawledPage[];
  discoveredLinks: DiscoveredLink[];
}

async function runPipeline(input: PipelineInput): Promise<BusinessAnalysis> {
  const started = Date.now();
  const modelsUsed: string[] = [];
  const pagesWithContent = input.pages.filter(pageHasContent).length;
  const pagesContext = renderPagesContext(input.pages);

  // STEP 1: plan + identify
  const { plan, model: planModel } = await draftPlan(input);
  modelsUsed.push(planModel);

  const clientName = plan.discovered_name.trim() || input.hints.name || "Unknown Business";
  const location = plan.discovered_location.trim() || input.hints.location || "";

  // STEP 2: extraction and web research run side by side
  const [extraction, research] = await Promise.all([
    extractFacts({ clientName, location, pagesContext, plan }).then((e) => {
      modelsUsed.push(MODELS.fast);
      return e;
    }),
    researchMarket({
      clientName,
      category: plan.business_category,
      location,
      sourceUrl: input.sourceUrl,
      notes: input.notes,
    })
      .then((r) => {
        modelsUsed.push(r.model);
        return r;
      })
      .catch((err) => {
        console.warn(`[ai] research skipped: ${describeError(err)}`);
        return { notes: "", searches: 0, model: null as ModelId | null };
      }),
  ]);

  // STEP 2c: follow-up only when the first pass was thin
  let followUp = "";
  if (extraction.confidence === "low" && pagesWithContent > 0 && extraction.data_gaps.length > 0) {
    try {
      followUp = await followUpExtraction({ gaps: extraction.data_gaps, pagesContext, extraction });
      if (followUp) modelsUsed.push(MODELS.fast);
    } catch (err) {
      console.warn(`[ai] follow-up skipped: ${describeError(err)}`);
    }
  }

  // STEP 3: generate
  const draft = await generateAnalysis({ clientName, location, extraction, plan, followUp, research: research.notes });
  modelsUsed.push(MODELS.balanced);

  // STEP 4: review
  const { approval, model: reviewModel } = await reviewAnalysis({
    clientName,
    plan,
    extraction,
    research: research.notes,
    draft,
  });
  modelsUsed.push(reviewModel);

  const reviewed = applyApproval(draft, approval);

  // Assemble the persisted shape. The existing-website fields come from the project, never the model.
  const prefill: PrefillData = pruneEmpty({
    your_story: { ...reviewed.prefill.your_story },
    services: { ...reviewed.prefill.services },
    your_customers: { ...reviewed.prefill.your_customers },
    goals: { ...reviewed.prefill.goals },
  }) as PrefillData;
  prefill.your_story ??= {};
  prefill.services ??= {};
  prefill.your_customers ??= {};
  if (input.sourceUrl) {
    prefill.content_media = { has_existing_website: true, existing_website_url: input.sourceUrl };
  }

  const analysis: BusinessAnalysis = deepScrub({
    business_name: reviewed.business_name,
    business_type: reviewed.business_type,
    location: reviewed.location,
    founded: reviewed.founded || undefined,
    services: reviewed.services,
    team: reviewed.team.length ? reviewed.team : undefined,
    locations: reviewed.locations.length ? reviewed.locations : undefined,
    description: reviewed.description,
    tone: reviewed.tone,
    branding_clues: reviewed.branding_clues,
    review_highlights: reviewed.review_highlights,
    strengths: reviewed.strengths,
    market: research.notes ? reviewed.market : undefined,
    suggested_questions: reviewed.suggested_questions,
    prefill,
    discovered_social_urls: input.discoveredLinks,
    _meta: {
      models_used: modelsUsed,
      pages_fetched: input.pages.length,
      pages_with_content: pagesWithContent,
      follow_up_performed: !!followUp,
      research_performed: !!research.notes,
      research_searches: research.searches,
      quality_score: approval.quality_score,
      approved: approval.approved,
      approval_notes: approval.notes,
      research_notes: research.notes ? research.notes.slice(0, 6000) : undefined,
      sources: sourcesSummary(input.pages),
      analyzed_at: new Date().toISOString(),
      duration_seconds: Math.round((Date.now() - started) / 1000),
    },
  });

  return analysis;
}

// ============================================================================
// PUBLIC ENTRY POINTS
// ============================================================================

/** URL-first flow: crawl the site, discover profiles, research the market, analyze. */
export async function analyzeFromUrl(sourceUrl: string, notes: string): Promise<BusinessAnalysis> {
  const { pages, discoveredLinks } = await crawlSite(sourceUrl);
  return runPipeline({
    sourceUrl,
    notes,
    hints: { name: "", type: "", location: "" },
    pages,
    discoveredLinks,
  });
}

/** Legacy flow: the admin entered the links by hand and we already know the name. */
export async function analyzeBusinessLinks(
  clientName: string,
  businessType: string,
  location: string,
  urls: DiscoveredLink[]
): Promise<BusinessAnalysis> {
  const { pages } = await fetchLinkedPages(urls);
  const website = urls.find((u) => u.platform === "Website")?.url ?? null;
  return runPipeline({
    sourceUrl: website,
    notes: "",
    hints: { name: clientName, type: businessType, location },
    pages,
    discoveredLinks: urls.filter((u) => u.platform !== "Website"),
  });
}
