import { z } from "zod";

/**
 * Structured-output schemas for the AI pipelines.
 * Every field is required (the API's constrained decoding needs closed schemas);
 * use `.nullable()` for "may be unknown" and empty arrays for "none found".
 */

// ============================================================================
// ANALYSIS PIPELINE
// ============================================================================

export const INTAKE_SECTIONS = [
  "your_story",
  "services",
  "your_customers",
  "your_brand",
  "content_media",
  "website_features",
  "goals",
] as const;

export const SuggestedQuestionSchema = z.object({
  section: z.enum(INTAKE_SECTIONS),
  question: z.string().describe("The question, written as Nathaniel would ask the client in person"),
  why: z.string().describe("One sentence on why the answer matters for building their website"),
});

export const PlanSchema = z.object({
  discovered_name: z
    .string()
    .describe("The business name exactly as it appears on the site. If a name was supplied, echo it unless the site clearly shows a different one"),
  discovered_location: z
    .string()
    .describe("Primary city and state, e.g. 'Titusville, FL'. Empty string if unknown"),
  business_category: z
    .string()
    .describe("Specific category, e.g. 'independent optometry practice with optical retail', not just 'eye doctor'"),
  extraction_focus: z.array(z.string()).describe("5-8 things the extractor must pull for THIS kind of business"),
  key_questions: z.array(z.string()).describe("3-5 questions the data must answer to build a site that gets customers"),
  look_for: z.array(z.string()).describe("Specific facts to hunt for: certifications, service area, team, years, hours, pricing signals"),
  red_flags: z.array(z.string()).describe("Things that look inconsistent or need verifying. Empty if none"),
  strategy_notes: z.string().describe("2-3 sentences on how to position this business online"),
});
export type Plan = z.infer<typeof PlanSchema>;

export const TeamMemberSchema = z.object({
  name: z.string(),
  role: z.string().describe("Title or role as stated, e.g. 'Optometrist' or 'Owner'"),
});

export const LocationSchema = z.object({
  name: z.string().describe("Location nickname if the business uses one, else the city"),
  address: z.string().describe("Street address as written, or empty string"),
  phone: z.string().describe("Phone number as written, or empty string"),
});

export const ExtractionSchema = z.object({
  business_name: z.string(),
  business_type: z.string(),
  location: z.string().describe("City, State"),
  founded: z.string().describe("Founding year or 'since YYYY' phrasing found on the site, else empty string"),
  services: z.array(z.string()).describe("Every service or product line the site itself names"),
  team: z.array(TeamMemberSchema).describe("Named people with roles, if the site lists them"),
  locations: z.array(LocationSchema).describe("Physical locations found, if any"),
  description: z.string().describe("1-2 factual sentences summarising the business"),
  tone: z.string().describe("2-3 words describing the brand voice"),
  branding_clues: z.array(z.string()).describe("Colors, taglines, logos, sub-brands, design signals"),
  review_highlights: z
    .array(z.string())
    .describe("Direct customer quotes or clearly stated review themes. Empty if none found; never write explanations here"),
  strengths: z.array(z.string()).describe("What the evidence shows they do well"),
  raw_facts: z.array(z.string()).describe("Every specific fact found: numbers, names, certifications, hours, areas, equipment, insurers"),
  data_gaps: z.array(z.string()).describe("Items from the extraction plan that could not be found"),
  confidence: z.enum(["low", "medium", "high"]),
});
export type Extraction = z.infer<typeof ExtractionSchema>;

export const CompetitorSchema = z.object({
  name: z.string(),
  url: z.string().describe("Website URL or empty string"),
  rating: z.string().describe("e.g. '4.8 (212 reviews)' or empty string"),
  notes: z.string().describe("One line on what they do well or poorly online"),
});

export const MarketSchema = z.object({
  google_rating: z.string().describe("e.g. '4.9' or empty string if not found"),
  review_count: z.string().describe("e.g. '312' or empty string if not found"),
  review_themes: z.array(z.string()).describe("Recurring praise or complaints from real reviews"),
  competitors: z.array(CompetitorSchema),
  notable: z.array(z.string()).describe("News, awards, ownership, related brands, anything the owner should know"),
  sources: z.array(z.string()).describe("URLs the research was based on"),
});
export type Market = z.infer<typeof MarketSchema>;

export const PrefillSchema = z.object({
  your_story: z.object({
    how_started: z.string().nullable().describe("Origin story in the owner's own voice, only if the site tells it"),
    years_in_business: z.string().nullable().describe("e.g. 'Since 2004' or '20+ years', only if stated"),
    differentiator: z.string().nullable().describe("What sets them apart, in the owner's own voice, from real evidence"),
  }),
  services: z.object({
    main_services: z.array(z.string()).describe("Confirmed services only"),
    specialty: z.string().nullable().describe("Their primary focus if clear"),
    service_area: z.string().nullable().describe("Specific area served if stated"),
  }),
  your_customers: z.object({
    ideal_customer: z.string().nullable().describe("Who they serve, in the owner's own voice"),
    how_they_find_you: z.array(z.string()).describe("Channels with evidence, e.g. 'Google search', 'Facebook', 'referrals'"),
  }),
  goals: z.object({
    competitor_url: z.string().nullable().describe("A named competitor's website only if explicitly identified"),
  }),
});

// Generation is split into two smaller schemas; one combined schema exceeds the API's grammar size limit.
export const CoreAnalysisSchema = z.object({
  business_name: z.string(),
  business_type: z.string(),
  location: z.string(),
  founded: z.string(),
  services: z.array(z.string()),
  team: z.array(TeamMemberSchema),
  locations: z.array(LocationSchema),
  description: z.string().describe("Refined 1-2 sentence description for the agency owner, third person"),
  tone: z.string(),
  branding_clues: z.array(z.string()),
  review_highlights: z.array(z.string()),
  strengths: z.array(z.string()),
  market: MarketSchema,
});
export type CoreAnalysis = z.infer<typeof CoreAnalysisSchema>;

export const GuidanceSchema = z.object({
  suggested_questions: z.array(SuggestedQuestionSchema).describe("5-8 questions across different sections"),
  prefill: PrefillSchema,
});
export type Guidance = z.infer<typeof GuidanceSchema>;

export type AnalysisDraft = CoreAnalysis & Guidance;

export const CORRECTABLE_FIELDS = ["business_name", "business_type", "location", "founded", "description", "tone"] as const;

export const PREFILL_PATHS = [
  "your_story.how_started",
  "your_story.years_in_business",
  "your_story.differentiator",
  "services.specialty",
  "services.service_area",
  "your_customers.ideal_customer",
  "goals.competitor_url",
] as const;

export const ApprovalSchema = z.object({
  approved: z.boolean(),
  quality_score: z.enum(["poor", "fair", "good", "excellent"]),
  field_corrections: z
    .array(
      z.object({
        field: z.enum(CORRECTABLE_FIELDS),
        corrected: z.string().describe("The exact final text that should replace the field. Never an instruction or a comment"),
      })
    )
    .describe("Only fields that are actually wrong"),
  services_to_remove: z.array(z.string()).describe("Services not confirmed by the source data, copied exactly as listed"),
  services_to_add: z.array(z.string()).describe("Confirmed services the draft missed"),
  strengths_to_remove: z.array(z.string()).describe("Strengths that are assumptions rather than evidence, copied exactly"),
  review_highlights_to_remove: z.array(z.string()).describe("Entries that are not real quotes or themes, copied exactly"),
  market_notable_to_remove: z.array(z.string()).describe("market.notable entries not supported by the research, copied exactly"),
  competitors_to_remove: z.array(z.string()).describe("Competitor names not supported by the research"),
  questions_to_remove: z.array(z.number().int()).describe("Zero-based indexes of generic or redundant questions to drop"),
  questions_to_add: z.array(SuggestedQuestionSchema).describe("Better questions to add"),
  prefill_overrides: z.array(
    z.object({
      path: z.enum(PREFILL_PATHS),
      action: z.enum(["remove", "replace"]),
      value: z.string().nullable().describe("Replacement text when action is 'replace'"),
    })
  ),
  notes: z.string().describe("Honest notes for the agency owner: what was found, data quality, what to ask the client"),
});
export type Approval = z.infer<typeof ApprovalSchema>;

// ============================================================================
// PROPOSAL PIPELINE
// ============================================================================

export const ProposalPlanSchema = z.object({
  positioning: z.string().describe("2-3 sentences on how to position L3ad Solutions for this client (I/my, never we/our)"),
  pain_points: z.array(z.string()).describe("6 specific pain points this client likely faces, industry-specific"),
  recommended_services: z.array(z.string()).describe("The L3ad services or bundles to recommend"),
  pricing_strategy: z.string().describe("Which tier and why, bundles that make sense, total monthly estimate"),
  competitive_angle: z.string(),
  roi_narrative: z.string().describe("Realistic ROI story and why"),
});
export type ProposalPlan = z.infer<typeof ProposalPlanSchema>;

const LabelDescription = z.object({ label: z.string(), description: z.string() });
const TitledItems = z.object({ title: z.string(), items: z.array(z.string()) });

// The deck is generated in three parts; one schema for all ten slides exceeds the API's grammar size limit.
export const ProposalStorySchema = z.object({
  title: z.object({
    client_name: z.string(),
    date: z.string().describe("Month Year"),
    subtitle: z.string().describe("Short tagline"),
  }),
  pain_points_heading: z.string(),
  pain_points_subheading: z.string(),
  pain_points: z.array(
    z.object({
      icon: z.string().describe("Bootstrap icon class, e.g. 'bi-search'"),
      title: z.string(),
      description: z.string(),
    })
  ),
  why_new_website: z.object({
    before: z.array(LabelDescription),
    after: z.array(LabelDescription),
  }),
  aida_strategy: z.object({
    attention: TitledItems,
    interest: TitledItems,
    desire: TitledItems,
    action: TitledItems,
  }),
});

export const ProposalNumbersSchema = z.object({
  itemized_pricing: z.object({
    sections: z.array(
      z.object({
        category: z.string(),
        items: z.array(
          z.object({
            name: z.string(),
            description: z.string().describe("What it includes, or empty string"),
            price: z.string().describe("'$X,XXX', '$X/mo', or empty string when included"),
          })
        ),
        subtotal: z.string().describe("Section subtotal or empty string"),
      })
    ),
  }),
  competitors: z.object({
    entries: z.array(
      z.object({
        name: z.string(),
        website_score: z.string(),
        seo_score: z.string(),
        reviews: z.string(),
        notes: z.string(),
      })
    ),
    unfair_advantage: z.string(),
  }),
  roi: z.object({
    monthly_cost: z.string(),
    revenue_per_customer: z.string(),
    new_customers_per_month: z.string(),
    monthly_revenue: z.string(),
    annual_revenue: z.string(),
    roi_percentage: z.string(),
    cost_breakdown: z.array(z.object({ label: z.string(), amount: z.string() })),
    revenue_model: z.array(z.object({ label: z.string(), value: z.string() })),
    projections: z.array(
      z.object({
        month: z.string(),
        clients: z.string(),
        revenue: z.string(),
        cumulative: z.string(),
      })
    ),
    callout: z.string().describe("2-3 short lines in plain language, separated by newlines"),
  }),
});

export const ProposalCloseSchema = z.object({
  timeline: z.object({
    phases: z.array(
      z.object({
        phase_number: z.number().int(),
        title: z.string(),
        duration: z.string(),
        tasks: z.array(z.string()),
      })
    ),
  }),
  pricing_summary: z.object({
    packages: z.array(
      z.object({
        label: z.string(),
        original_price: z.string(),
        price: z.string(),
        frequency: z.string().describe("'/mo' or 'one-time'"),
        savings: z.string(),
        highlighted: z.boolean(),
      })
    ),
    personal_note: z.string(),
  }),
  next_steps: z.object({
    steps: z.array(z.object({ number: z.number().int(), title: z.string(), description: z.string() })),
    cta_text: z.string(),
    cta_url: z.string(),
  }),
});

export type ProposalDraft = z.infer<typeof ProposalStorySchema> &
  z.infer<typeof ProposalNumbersSchema> &
  z.infer<typeof ProposalCloseSchema>;

export const ProposalReviewSchema = z.object({
  approved: z.boolean(),
  corrections: z.array(
    z.object({
      path: z.string().describe("Dot path to a string or number field, e.g. 'roi.monthly_revenue' or 'pricing_summary.packages.1.price'"),
      issue: z.string(),
      fix: z.string().describe("The exact replacement value as plain text"),
    })
  ),
  notes: z.string(),
});
export type ProposalReview = z.infer<typeof ProposalReviewSchema>;
