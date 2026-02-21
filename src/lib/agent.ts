import "server-only";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.AGENT_1 });

// Latest models — optimized for cost and quality
const MODELS = {
  fast: "claude-haiku-4-5-20251001", // $1/$5  — extraction grunt work
  balanced: "claude-sonnet-4-6",     // $3/$15 — creative generation
  quality: "claude-opus-4-6",        // $5/$25 — strategy + final approval
} as const;

// ============================================================================
// PUBLIC TYPES
// ============================================================================

export interface BusinessAnalysis {
  business_name: string;
  business_type: string;
  location: string;
  services: string[];
  description: string;
  tone: string;
  branding_clues: string[];
  review_highlights: string[];
  strengths: string[];
  suggested_questions: SuggestedQuestion[];
  prefill: PrefillData;
  discovered_social_urls?: { platform: string; url: string }[];
  _meta: AnalysisMeta;
}

export interface AnalysisMeta {
  models_used: string[];
  pages_fetched: number;
  pages_with_content: number;
  follow_up_performed: boolean;
  quality_score: string;
  approved: boolean;
  approval_notes: string;
}

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

// ============================================================================
// INTERNAL TYPES
// ============================================================================

// Opus plan from Step 1
interface OpusPlan {
  business_category: string;
  extraction_focus: string[];
  key_questions: string[];
  look_for: string[];
  red_flags: string[];
  strategy_notes: string;
}

// Extended plan for URL-first flow — Opus also discovers business identity
interface OpusPlanFromUrl extends OpusPlan {
  discovered_name: string;
  discovered_location: string;
}

// Haiku extraction from Step 2
interface RawExtraction {
  business_name: string;
  business_type: string;
  location: string;
  services: string[];
  description: string;
  tone: string;
  branding_clues: string[];
  review_highlights: string[];
  strengths: string[];
  raw_facts: string[];
  data_gaps: string[];
  confidence: "low" | "medium" | "high";
}

// Opus final approval from Step 4
interface OpusApproval {
  approved: boolean;
  quality_score: "poor" | "fair" | "good" | "excellent";
  corrections: {
    field: string;
    current: string;
    corrected: string;
  }[];
  question_overrides: {
    remove_index?: number;
    add?: SuggestedQuestion;
  }[];
  notes: string;
}

interface FetchResult {
  content: string;
  discoveredLinks: { platform: string; url: string }[];
}

// ============================================================================
// URL SECURITY
// ============================================================================

function validateUrl(url: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`Invalid URL: ${url}`);
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error(`Blocked protocol: ${parsed.protocol}`);
  }

  const hostname = parsed.hostname.toLowerCase();

  const blocked = [
    "localhost", "127.0.0.1", "0.0.0.0", "[::1]",
    "metadata.google.internal", "169.254.169.254",
  ];
  if (blocked.includes(hostname)) {
    throw new Error(`Blocked host: ${hostname}`);
  }

  const ipMatch = hostname.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (ipMatch) {
    const [, a, b] = ipMatch.map(Number);
    if (
      a === 10 || a === 127 || a === 0 || a === 169 ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168)
    ) {
      throw new Error(`Blocked private IP: ${hostname}`);
    }
  }
}

// ============================================================================
// LINK EXTRACTION
// ============================================================================

const SOCIAL_DOMAINS: Record<string, string> = {
  "facebook.com": "Facebook",
  "instagram.com": "Instagram",
  "linkedin.com": "LinkedIn",
  "twitter.com": "Twitter",
  "x.com": "Twitter",
  "youtube.com": "YouTube",
  "tiktok.com": "TikTok",
  "yelp.com": "Yelp",
  "nextdoor.com": "Nextdoor",
  "bbb.org": "BBB",
  "homeadvisor.com": "HomeAdvisor",
  "houzz.com": "Houzz",
  "thumbtack.com": "Thumbtack",
  "angieslist.com": "Angie's List",
  "angi.com": "Angi",
  "google.com": "Google Business",
};

/** Extract recognized social/business profile links from raw HTML */
function extractLinksFromHtml(html: string, sourceHost: string): { platform: string; url: string }[] {
  const linkRegex = /href=["']([^"']+)["']/gi;
  const seen = new Set<string>();
  const results: { platform: string; url: string }[] = [];

  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1];
    let parsed: URL;
    try {
      parsed = new URL(href, `https://${sourceHost}`);
    } catch {
      continue;
    }

    if (!["http:", "https:"].includes(parsed.protocol)) continue;

    const hostname = parsed.hostname.replace(/^www\./, "").toLowerCase();

    // Skip same-site links
    if (hostname === sourceHost.replace(/^www\./, "").toLowerCase()) continue;

    // Check if this is a recognized social/business domain
    let platform: string | null = null;
    for (const [domain, name] of Object.entries(SOCIAL_DOMAINS)) {
      if (hostname === domain || hostname.endsWith(`.${domain}`)) {
        platform = name;
        break;
      }
    }

    if (!platform) continue;

    // Deduplicate by full URL (strip trailing slash for consistency)
    const normalized = parsed.href.replace(/\/$/, "");
    if (seen.has(normalized)) continue;
    seen.add(normalized);

    results.push({ platform, url: parsed.href });
  }

  return results;
}

// ============================================================================
// UTILITIES
// ============================================================================

async function fetchPageContent(url: string): Promise<FetchResult> {
  try {
    validateUrl(url);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; L3adBot/1.0; +https://l3adsolutions.com)",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return { content: `[Failed to fetch: HTTP ${res.status}]`, discoveredLinks: [] };
    }

    const html = await res.text();

    // Extract links from raw HTML before stripping tags
    const sourceHost = new URL(url).hostname;
    const discoveredLinks = extractLinksFromHtml(html, sourceHost);

    const cleaned = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 8000);

    return {
      content: cleaned || "[Page loaded but no text content found]",
      discoveredLinks,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return { content: `[Failed to fetch: ${msg}]`, discoveredLinks: [] };
  }
}

function parseJSON<T>(text: string): T {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON found in response");

  let json = match[0];

  // Clean common AI output issues before parsing:
  // 1. Remove single-line JS comments (// ...) that aren't inside strings
  json = json.replace(/,\s*\/\/[^\n]*/g, ",");  // after comma
  json = json.replace(/\{\s*\/\/[^\n]*/g, "{");  // after opening brace
  // 2. Remove trailing commas before } or ]
  json = json.replace(/,\s*([\]}])/g, "$1");

  try {
    return JSON.parse(json) as T;
  } catch (e) {
    // Log the raw text for debugging, then rethrow
    console.error("JSON parse failed. Raw model output (first 500 chars):", text.slice(0, 500));
    throw e;
  }
}

function getResponseText(response: Anthropic.Message): string {
  return response.content[0].type === "text" ? response.content[0].text : "";
}

async function callModel(model: string, maxTokens: number, prompt: string): Promise<string> {
  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }],
  });
  return getResponseText(response);
}

// Try Opus, fall back to Sonnet if unavailable
async function callManager(maxTokens: number, prompt: string): Promise<{ text: string; model: string }> {
  try {
    const text = await callModel(MODELS.quality, maxTokens, prompt);
    return { text, model: MODELS.quality };
  } catch {
    const text = await callModel(MODELS.balanced, maxTokens, prompt);
    return { text, model: MODELS.balanced };
  }
}

// ============================================================================
// STEP 1: OPUS (Manager) — Analyze the situation, draft extraction strategy
// ============================================================================

async function opusDraftPlan(
  clientName: string,
  businessType: string,
  location: string,
  pagesSummary: string
): Promise<{ plan: OpusPlan; model: string }> {
  const { text, model } = await callManager(1000, `You are the senior strategist at L3ad Solutions, a web design agency. A new client just came in and your team scraped their online presence. Before the junior analysts extract data, YOU need to tell them exactly what to look for.

CLIENT: ${clientName}
TYPE: ${businessType || "Unknown"}
LOCATION: ${location || "Unknown"}

PAGE CONTENT PREVIEW (first 2000 chars of each page):
${pagesSummary}

Based on what you can see, draft an extraction strategy. Return ONLY a JSON object:
{
  "business_category": "specific business category (e.g. 'residential screen enclosure contractor', not just 'contractor')",
  "extraction_focus": ["the 5-8 most important things to extract for THIS type of business — be specific to the industry"],
  "key_questions": ["3-5 questions we MUST answer from the data to build a good website for them"],
  "look_for": ["specific details to hunt for: certifications, service area boundaries, pricing signals, team info, years in business, materials used, etc."],
  "red_flags": ["things that seem off, inconsistent, or need verification"],
  "strategy_notes": "2-3 sentences about how to position this business on their website — what angle to take, what to emphasize, what makes them compelling in their market"
}

Think like a strategist, not a data entry clerk. What matters for building THIS client a website that actually gets them customers?`);

  return { plan: parseJSON<OpusPlan>(text), model };
}

// ============================================================================
// STEP 1 (URL-first): OPUS — Discover business identity + draft strategy
// ============================================================================

async function opusDraftPlanFromUrl(
  sourceUrl: string,
  notes: string,
  pagesSummary: string,
  discoveredLinks: { platform: string; url: string }[]
): Promise<{ plan: OpusPlanFromUrl; model: string }> {
  const linksText = discoveredLinks.length > 0
    ? `\nDISCOVERED LINKS FROM WEBSITE:\n${discoveredLinks.map(l => `- ${l.platform}: ${l.url}`).join("\n")}`
    : "\nNo social/business links discovered on the website.";

  const { text, model } = await callManager(1200, `You are the senior strategist at L3ad Solutions, a web design agency. A potential client's website URL was just submitted. Your job is to:
1. IDENTIFY the business (name, location, type) from the page content
2. Draft an extraction strategy for the team

SOURCE URL: ${sourceUrl}
${notes ? `ADMIN NOTES: ${notes}` : ""}
${linksText}

PAGE CONTENT PREVIEW (first 2000 chars of each page):
${pagesSummary}

Return ONLY a JSON object:
{
  "discovered_name": "the actual business name found on the website",
  "discovered_location": "city, state — best guess from content, addresses, service areas, phone area codes",
  "business_category": "specific business category (e.g. 'residential screen enclosure contractor', not just 'contractor')",
  "extraction_focus": ["the 5-8 most important things to extract for THIS type of business"],
  "key_questions": ["3-5 questions we MUST answer from the data"],
  "look_for": ["specific details to hunt for: certifications, service area, pricing signals, team info, years in business, etc."],
  "red_flags": ["things that seem off, inconsistent, or need verification"],
  "strategy_notes": "2-3 sentences about how to position this business"
}

IMPORTANT: discovered_name should be the ACTUAL business name as it appears on the site (not a domain slug). If you can't find a clear name, use a cleaned-up version of the domain.
discovered_location should be their primary location. Look for addresses, "serving X area", phone area codes, Google Maps embeds, etc.`);

  return { plan: parseJSON<OpusPlanFromUrl>(text), model };
}

// ============================================================================
// STEP 2: HAIKU (Worker) — Execute targeted extraction following Opus's plan
// ============================================================================

async function haikuExtract(
  clientName: string,
  businessType: string,
  location: string,
  pagesContext: string,
  plan: OpusPlan
): Promise<RawExtraction> {
  const text = await callModel(MODELS.fast, 1500, `Extract business data from these web pages following the senior strategist's plan. Return ONLY a JSON object, no markdown.

CLIENT: ${clientName} | TYPE: ${plan.business_category} | LOCATION: ${location || "Unknown"}

STRATEGIST'S EXTRACTION PLAN:
Focus on: ${plan.extraction_focus.join(", ")}
Specifically look for: ${plan.look_for.join(", ")}
Key questions to answer: ${plan.key_questions.join(", ")}

PAGES:
${pagesContext}

Return this exact JSON structure:
{
  "business_name": "actual name found",
  "business_type": "${plan.business_category}",
  "location": "city, state",
  "services": ["every service mentioned"],
  "description": "1-2 sentence summary",
  "tone": "2-3 word brand voice description",
  "branding_clues": ["colors, logos, visual elements found"],
  "review_highlights": ["quotes or themes from reviews"],
  "strengths": ["what they do well"],
  "raw_facts": ["every specific fact found — follow the strategist's look_for list above"],
  "data_gaps": ["things from the extraction plan we couldn't find"],
  "confidence": "low/medium/high based on how much content was available"
}

Follow the strategist's plan carefully. Extract EVERYTHING they asked for.`);

  return parseJSON<RawExtraction>(text);
}

// ============================================================================
// STEP 2b: HAIKU (Worker) — Follow-up extraction when manager requests it
// ============================================================================

async function haikuFollowUp(
  instructions: string,
  pagesContext: string,
  extraction: RawExtraction
): Promise<string> {
  return await callModel(MODELS.fast, 800, `The senior strategist reviewed your extraction and found gaps. Re-read the pages and dig deeper.

STRATEGIST'S INSTRUCTIONS: ${instructions}

WHAT YOU ALREADY FOUND:
${JSON.stringify({ services: extraction.services, strengths: extraction.strengths, raw_facts: extraction.raw_facts }, null, 2)}

ORIGINAL PAGES (re-read carefully):
${pagesContext}

Look for: specific numbers, names, certifications, neighborhoods, pricing indicators, years of experience, team mentions, specialties buried in text.

Return a plain text summary of additional findings. If nothing new, say "No additional data found."`);
}

// ============================================================================
// STEP 3: SONNET (Analyst) — Generate polished analysis with Opus's strategy
// ============================================================================

async function sonnetGenerate(
  clientName: string,
  location: string,
  extraction: RawExtraction,
  plan: OpusPlan,
  followUpData?: string
): Promise<BusinessAnalysis> {
  const followUpText = followUpData
    ? `\nADDITIONAL DATA FROM FOLLOW-UP:\n${followUpData}`
    : "";

  const text = await callModel(MODELS.balanced, 2500, `Generate the final client analysis for L3ad Solutions. The senior strategist has already reviewed the raw data and provided strategic direction. Return ONLY a JSON object, no markdown.

CLIENT: ${clientName} | TYPE: ${plan.business_category} | LOCATION: ${location || extraction.location}

STRATEGIST'S POSITIONING NOTES:
${plan.strategy_notes}

RED FLAGS TO ADDRESS:
${plan.red_flags.length > 0 ? plan.red_flags.join(", ") : "None identified"}

RAW EXTRACTION:
${JSON.stringify(extraction, null, 2)}
${followUpText}

Return this exact JSON:
{
  "business_name": "${extraction.business_name}",
  "business_type": "${plan.business_category}",
  "location": "${extraction.location}",
  "services": ${JSON.stringify(extraction.services)},
  "description": "refined 1-2 sentence description incorporating the strategist's positioning",
  "tone": "${extraction.tone}",
  "branding_clues": ${JSON.stringify(extraction.branding_clues)},
  "review_highlights": ${JSON.stringify(extraction.review_highlights)},
  "strengths": ${JSON.stringify(extraction.strengths)},
  "suggested_questions": [
    {
      "section": "your_story|services|your_customers|your_brand|content_media|website_features|goals",
      "question": "conversational question specific to THIS business",
      "why": "why this matters for their website"
    }
  ],
  "prefill": {
    "your_story": {
      "differentiator": "what sets them apart based on real evidence"
    },
    "services": {
      "main_services": ["confirmed services"],
      "specialty": "their primary focus if clear",
      "service_area": "specific area they serve"
    },
    "your_customers": {
      "ideal_customer": "who they serve",
      "how_they_find_you": ["channels they use"]
    },
    "content_media": {
      "has_existing_website": true,
      "existing_website_url": "their current site URL if found"
    },
    "goals": {
      "competitor_url": "a competitor URL if found in the data"
    }
  }
}

RULES FOR QUESTIONS:
- Generate 5-8 questions across different sections
- Use the strategist's key questions as starting points: ${plan.key_questions.join("; ")}
- Questions must be conversational ("Tell us about..." not "Describe your...")
- Questions must be SPECIFIC to their business — reference their actual services, location, or industry
- Include questions that probe the data gaps: ${extraction.data_gaps.join(", ")}
- Include at least one "your_brand" question about visual preferences (e.g. dark vs light website, what vibe they want)
- Each question should help build a website that gets them more customers

RULES FOR PREFILL:
- Only prefill fields you are CONFIDENT about from the source data
- For content_media.has_existing_website, set true only if you found an actual website URL
- For goals.competitor_url, only include if a competitor was explicitly mentioned
- Wrong prefill is worse than no prefill — when in doubt, leave it out`);

  return parseJSON<BusinessAnalysis>(text);
}

// ============================================================================
// STEP 4: OPUS (Manager) — Final review, corrections, approval
// ============================================================================

async function opusApprove(
  clientName: string,
  plan: OpusPlan,
  extraction: RawExtraction,
  analysis: BusinessAnalysis
): Promise<{ approval: OpusApproval; model: string }> {
  const { text, model } = await callManager(1500, `You are the senior strategist at L3ad Solutions doing final quality control. Your team extracted data and generated a client analysis. Before this goes to the agency owner, YOU must approve it.

CLIENT: ${clientName} (${plan.business_category})

YOUR ORIGINAL STRATEGY:
${plan.strategy_notes}
Key questions you wanted answered: ${plan.key_questions.join("; ")}

RAW FACTS AVAILABLE:
${JSON.stringify(extraction.raw_facts, null, 2)}

PROPOSED ANALYSIS TO SHOW THE OWNER:
${JSON.stringify({
  business_name: analysis.business_name,
  business_type: analysis.business_type,
  location: analysis.location,
  description: analysis.description,
  services: analysis.services,
  tone: analysis.tone,
  strengths: analysis.strengths,
  suggested_questions: analysis.suggested_questions,
  prefill: analysis.prefill,
}, null, 2)}

Review critically and return ONLY a JSON object:
{
  "approved": true/false,
  "quality_score": "poor/fair/good/excellent",
  "corrections": [
    {"field": "which field", "current": "what it says now", "corrected": "what it should say"}
  ],
  "question_overrides": [
    {"remove_index": 0, "add": null},
    {"remove_index": null, "add": {"section": "services", "question": "better question", "why": "reason"}}
  ],
  "notes": "Brief notes for the agency owner about what we found, data quality, and anything they should ask the client directly. Be honest about gaps."
}

APPROVAL CRITERIA:
- Business name, type, and location are accurate
- Description honestly represents the business (no hallucinated claims)
- Services listed are actually confirmed in the source data
- Questions are specific and useful (not generic)
- Prefill data is accurate — wrong prefill is worse than no prefill
- The analysis is good enough that the owner can confidently preview it

Be strict. If something is wrong, correct it. If a question is generic garbage, remove it and add a better one. If the data is thin but honest, approve it with notes. Only reject if the analysis is misleading.`);

  return { approval: parseJSON<OpusApproval>(text), model };
}

// Apply Opus corrections to the analysis
function applyCorrections(analysis: BusinessAnalysis, approval: OpusApproval): BusinessAnalysis {
  const result = { ...analysis };

  // Apply field corrections
  for (const c of approval.corrections) {
    const key = c.field as keyof BusinessAnalysis;
    if (key in result && key !== "_meta" && key !== "suggested_questions" && key !== "prefill") {
      (result as Record<string, unknown>)[key] = c.corrected;
    }
  }

  // Apply question overrides (removals first, then additions)
  if (approval.question_overrides.length > 0) {
    const toRemove = new Set<number>();
    const toAdd: SuggestedQuestion[] = [];

    for (const override of approval.question_overrides) {
      if (override.remove_index != null) {
        toRemove.add(override.remove_index);
      }
      if (override.add) {
        toAdd.push(override.add);
      }
    }

    result.suggested_questions = result.suggested_questions.filter(
      (_, i) => !toRemove.has(i)
    );
    result.suggested_questions.push(...toAdd);
  }

  return result;
}

// ============================================================================
// MAIN PIPELINE: Opus Plan → Haiku Extract → Sonnet Generate → Opus Approve
// (Legacy path — used when project has manually-entered social URLs)
// ============================================================================

export async function analyzeBusinessLinks(
  clientName: string,
  businessType: string,
  location: string,
  urls: { platform: string; url: string }[]
): Promise<BusinessAnalysis> {
  // Fetch all URLs in parallel
  const pageResults = await Promise.all(
    urls.map(async (link) => {
      const { content } = await fetchPageContent(link.url);
      return { platform: link.platform, url: link.url, content };
    })
  );

  const pagesContext = pageResults
    .map((p) => `--- ${p.platform} (${p.url}) ---\n${p.content}`)
    .join("\n\n");

  const pagesWithContent = pageResults.filter(
    (p) => !p.content.startsWith("[Failed") && !p.content.startsWith("[Page loaded but no")
  ).length;

  // Shorter summary for Opus planning (save tokens — Opus is $5/$25)
  const pagesSummary = pageResults
    .map((p) => `--- ${p.platform} ---\n${p.content.slice(0, 2000)}`)
    .join("\n\n");

  const modelsUsed: string[] = [];

  // STEP 1: Opus (Manager) — Draft the extraction strategy
  const { plan, model: planModel } = await opusDraftPlan(clientName, businessType, location, pagesSummary);
  modelsUsed.push(planModel);

  // STEP 2: Haiku (Worker) — Execute targeted extraction
  const extraction = await haikuExtract(clientName, businessType, location, pagesContext, plan);
  modelsUsed.push(MODELS.fast);

  // STEP 2b (conditional): If extraction confidence is low + pages had content, do a follow-up
  let followUpData: string | undefined;
  if (extraction.confidence === "low" && pagesWithContent > 0 && extraction.data_gaps.length > 0) {
    const followUp = await haikuFollowUp(
      `Fill these gaps: ${extraction.data_gaps.join(", ")}. ${plan.extraction_focus.slice(0, 3).join(", ")}`,
      pagesContext,
      extraction
    );
    if (!followUp.includes("No additional data found")) {
      followUpData = followUp;
      modelsUsed.push(MODELS.fast);
    }
  }

  // STEP 3: Sonnet (Analyst) — Generate polished analysis
  const draft = await sonnetGenerate(clientName, location, extraction, plan, followUpData);
  modelsUsed.push(MODELS.balanced);

  // STEP 4: Opus (Manager) — Final review and approval
  const { approval, model: approvalModel } = await opusApprove(clientName, plan, extraction, draft);
  modelsUsed.push(approvalModel);

  // Apply Opus corrections
  const analysis = applyCorrections(draft, approval);

  // Attach metadata
  analysis._meta = {
    models_used: modelsUsed,
    pages_fetched: pageResults.length,
    pages_with_content: pagesWithContent,
    follow_up_performed: !!followUpData,
    quality_score: approval.quality_score,
    approved: approval.approved,
    approval_notes: approval.notes,
  };

  return analysis;
}

// ============================================================================
// URL-FIRST PIPELINE: Discover business from a single URL + notes
// ============================================================================

export async function analyzeFromUrl(
  sourceUrl: string,
  notes: string
): Promise<BusinessAnalysis> {
  // 1. Fetch the source URL and extract discovered links
  const { content: sourceContent, discoveredLinks } = await fetchPageContent(sourceUrl);

  // 2. Fetch up to 5 discovered links in parallel
  const linksToFetch = discoveredLinks.slice(0, 5);
  const linkedResults = await Promise.all(
    linksToFetch.map(async (link) => {
      const { content } = await fetchPageContent(link.url);
      return { platform: link.platform, url: link.url, content };
    })
  );

  // Combine source page + discovered pages
  const allPages = [
    { platform: "Website", url: sourceUrl, content: sourceContent },
    ...linkedResults,
  ];

  const pagesContext = allPages
    .map((p) => `--- ${p.platform} (${p.url}) ---\n${p.content}`)
    .join("\n\n");

  const pagesWithContent = allPages.filter(
    (p) => !p.content.startsWith("[Failed") && !p.content.startsWith("[Page loaded but no")
  ).length;

  const pagesSummary = allPages
    .map((p) => `--- ${p.platform} ---\n${p.content.slice(0, 2000)}`)
    .join("\n\n");

  const modelsUsed: string[] = [];

  // STEP 1: Opus — Discover business identity + draft strategy
  const { plan, model: planModel } = await opusDraftPlanFromUrl(
    sourceUrl, notes, pagesSummary, discoveredLinks
  );
  modelsUsed.push(planModel);

  const clientName = plan.discovered_name || "Unknown Business";
  const location = plan.discovered_location || "";

  // STEP 2: Haiku — Execute targeted extraction
  const extraction = await haikuExtract(clientName, "", location, pagesContext, plan);
  modelsUsed.push(MODELS.fast);

  // STEP 2b: Follow-up if confidence is low
  let followUpData: string | undefined;
  if (extraction.confidence === "low" && pagesWithContent > 0 && extraction.data_gaps.length > 0) {
    const followUp = await haikuFollowUp(
      `Fill these gaps: ${extraction.data_gaps.join(", ")}. ${plan.extraction_focus.slice(0, 3).join(", ")}`,
      pagesContext,
      extraction
    );
    if (!followUp.includes("No additional data found")) {
      followUpData = followUp;
      modelsUsed.push(MODELS.fast);
    }
  }

  // STEP 3: Sonnet — Generate polished analysis
  const draft = await sonnetGenerate(clientName, location, extraction, plan, followUpData);
  modelsUsed.push(MODELS.balanced);

  // STEP 4: Opus — Final review and approval
  const { approval, model: approvalModel } = await opusApprove(clientName, plan, extraction, draft);
  modelsUsed.push(approvalModel);

  // Apply corrections
  const analysis = applyCorrections(draft, approval);

  // Attach discovered social URLs for the caller to persist
  analysis.discovered_social_urls = discoveredLinks;

  // Attach metadata
  analysis._meta = {
    models_used: modelsUsed,
    pages_fetched: allPages.length,
    pages_with_content: pagesWithContent,
    follow_up_performed: !!followUpData,
    quality_score: approval.quality_score,
    approved: approval.approved,
    approval_notes: approval.notes,
  };

  return analysis;
}
