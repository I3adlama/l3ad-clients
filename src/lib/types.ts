export interface Project {
  id: string;
  slug: string;
  client_name: string;
  business_type: string | null;
  location: string | null;
  social_urls: SocialUrl[];
  notes: string | null;
  source_url: string | null;
  status: "draft" | "sent" | "in_progress" | "completed";
  created_at: string;
  updated_at: string;
}

export interface SocialUrl {
  platform: string;
  url: string;
}

export interface UploadedFile {
  url: string;
  filename: string;
  size: number;
  content_type: string;
  uploaded_at: string;
}

export interface IntakeResponse {
  id: string;
  project_id: string;
  responses: IntakeResponses;
  current_step: number;
  completed: boolean;
  started_at: string;
  completed_at: string | null;
}

export interface IntakeResponses {
  your_story?: {
    how_started?: string;
    years_in_business?: string;
    proud_of?: string;
    differentiator?: string;
  };
  services?: {
    main_services?: string[];
    verified_services?: string[];
    additional_services?: string[];
    specialty?: string;
    service_area?: string;
    wants_pricing_research?: boolean;
    target_margin?: string;
  };
  your_customers?: {
    ideal_customer?: string;
    how_they_find_you?: string[];
    want_more_of?: string;
  };
  /** Internal / original data: what records the client keeps and how they'll share them */
  your_data?: {
    records_kept?: string[];
    data_location?: string[];
    tools_used?: string;
    monthly_inquiries?: string;
    share_method?: string;
    uploads?: UploadedFile[];
    known_patterns?: string;
    aggregate_ok?: string;
  };
  your_brand?: {
    dark_or_light?: string;
    brand_personality?: string[];
    has_brand_colors?: boolean;
    brand_colors?: string[];
    website_style?: string;
    color_mood?: string;
    inspiration_urls?: string[];
    uploads?: UploadedFile[];
  };
  /** @deprecated Use your_brand instead */
  look_and_feel?: {
    website_style?: string;
    color_mood?: string;
    photo_style?: string;
  };
  content_media?: {
    has_photos?: string;
    has_logo?: string;
    has_videos?: string;
    photo_style?: string;
    has_existing_website?: boolean;
    existing_website_url?: string;
    work_photo_uploads?: UploadedFile[];
    other_content?: string;
  };
  website_features?: {
    needed_features?: string[];
    other_features?: string;
  };
  goals?: {
    primary_goal?: string;
    timeline?: string;
    websites_admired?: string;
    competitor_url?: string;
    anything_else?: string;
  };
}

/** Client-safe mirror of PrefillData (agent.ts has `import "server-only"`) */
export interface AiPrefill {
  your_story?: {
    how_started?: string;
    years_in_business?: string;
    differentiator?: string;
  };
  services?: {
    main_services?: string[];
    specialty?: string;
    service_area?: string;
  };
  your_customers?: {
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

/** Friendly names for the model IDs recorded in ai_analysis._meta.models_used */
export const MODEL_LABELS: Record<string, string> = {
  "claude-opus-5": "Opus 5",
  "claude-sonnet-5": "Sonnet 5",
  "claude-haiku-4-5": "Haiku 4.5",
  "claude-haiku-4-5-20251001": "Haiku 4.5",
  "claude-opus-4-6": "Opus 4.6",
  "claude-sonnet-4-6": "Sonnet 4.6",
};

export function modelLabel(id: string): string {
  return MODEL_LABELS[id] || id.replace(/^claude-/, "");
}

export interface CreateProjectPayload {
  url: string;
  notes?: string;
}

export interface SaveIntakeStepPayload {
  step: number;
  section_key: keyof IntakeResponses;
  data: Record<string, unknown>;
  completed?: boolean;
}

export const STEP_SECTIONS: (keyof IntakeResponses)[] = [
  "your_story",
  "services",
  "your_customers",
  "your_data",
  "your_brand",
  "content_media",
  "website_features",
  "goals",
];

export const STEP_LABELS = [
  "Your Story",
  "Services",
  "Your Customers",
  "Your Numbers",
  "Your Brand",
  "Content & Media",
  "Website Features",
  "Goals",
];

// ============================================================================
// Proposal types — 10-slide presentation viewer
// ============================================================================

export interface Proposal {
  id: string;
  slug: string;
  project_id: string | null;
  client_name: string;
  contact_name: string | null;
  industry: string | null;
  proposal_data: ProposalData;
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at: string;
}

export interface ProposalData {
  /** Slide 1: Title */
  title: {
    client_name: string;
    date: string;
    subtitle?: string;
  };

  /** Slide 2: Pain Points */
  pain_points: {
    icon: string;
    title: string;
    description: string;
  }[];
  pain_points_heading?: string;
  pain_points_subheading?: string;

  /** Slide 3: Why New Website (or any before/after comparison) */
  why_new_website: {
    /** Optional overrides for clients who are not getting a new site */
    heading?: string;
    subheading?: string;
    before_label?: string;
    after_label?: string;
    before: { label: string; description: string }[];
    after: { label: string; description: string }[];
  };

  /** Slide 4: AIDA Strategy */
  aida_strategy: {
    attention: { title: string; items: string[] };
    interest: { title: string; items: string[] };
    desire: { title: string; items: string[] };
    action: { title: string; items: string[] };
  };

  /** Slide 5: Itemized Pricing */
  itemized_pricing: {
    sections: {
      category: string;
      items: {
        name: string;
        description?: string;
        price: string;
      }[];
      subtotal?: string;
    }[];
  };

  /** Slide 6: Competitors */
  competitors: {
    entries: {
      name: string;
      website_score?: string;
      seo_score?: string;
      reviews?: string;
      notes?: string;
      /** Optional labelled metrics; when present they replace the default Keywords/Traffic/Backlinks rows */
      metrics?: { label: string; value: string }[];
    }[];
    unfair_advantage: string;
  };

  /** Optional: Proof slide. Case studies and testimonials from other L3ad clients */
  case_studies?: {
    heading?: string;
    subheading?: string;
    entries: {
      client: string;
      industry: string;
      summary: string;
      stats: { value: string; label: string }[];
      quote?: string;
      quote_author?: string;
    }[];
  };

  /** Optional: 90-day roadmap with KPIs. When present it replaces the Timeline slide */
  roadmap?: {
    heading?: string;
    subheading?: string;
    phases: {
      label: string;
      days: string;
      goal: string;
      deliverables: string[];
    }[];
    kpis: {
      metric: string;
      baseline: string;
      target: string;
      tracked_by?: string;
    }[];
    footnote?: string;
  };

  /** Optional: What I need from you slide */
  what_we_need?: {
    heading?: string;
    subheading?: string;
    items: { icon?: string; title: string; detail: string }[];
    time_commitment?: {
      title: string;
      phases: { period: string; cadence: string; detail: string }[];
    };
  };

  /** Slide 7: ROI */
  roi: {
    monthly_cost: string;
    revenue_per_customer: string;
    new_customers_per_month: string;
    monthly_revenue: string;
    annual_revenue: string;
    roi_percentage: string;
    cost_breakdown?: { label: string; amount: string }[];
    revenue_model?: { label: string; value: string }[];
    projections?: {
      month: string;
      orders?: string;
      clients?: string;
      revenue: string;
      cumulative: string;
    }[];
    callout?: string;
  };

  /** Slide 8: Timeline */
  timeline: {
    phases: {
      phase_number: number;
      title: string;
      duration: string;
      tasks: string[];
    }[];
  };

  /** Slide 9: Pricing Summary */
  pricing_summary: {
    packages: {
      label: string;
      original_price?: string;
      price: string;
      frequency?: string;
      savings?: string;
      highlighted?: boolean;
    }[];
    personal_note?: string;
  };

  /** Slide 10: Next Steps */
  next_steps: {
    steps: {
      number: number;
      title: string;
      description: string;
    }[];
    cta_text?: string;
    cta_url?: string;
  };

  /** Optional: the animated "story" layout. When present it replaces the slide deck. */
  story?: StoryData;
}

export type StoryVisual = "website" | "profile" | "ads" | "seo" | "ai";

export interface StoryData {
  greeting_name: string;
  client_logo?: string;
  headline: string;
  sub: string;
  date: string;
  facts_heading: string;
  facts: {
    value: number;
    prefix?: string;
    suffix?: string;
    label: string;
    body: string;
    chips?: { value: string; label: string }[];
  }[];
  facts_close: { title: string; body: string };
  services_heading: string;
  services_sub: string;
  services: {
    visual: StoryVisual;
    name: string;
    tag: string;
    one_liner: string;
    get: string[];
    need: string;
    works: string;
    expect: string;
  }[];
  loop: { heading: string; body: string; steps: string[] };
  timeline_heading: string;
  timeline: { when: string; title: string; points: string[] }[];
  timeline_note: string;
  proof_heading: string;
  proof: {
    client: string;
    industry: string;
    stats: { value: string; label: string }[];
    quote?: string;
    author?: string;
  }[];
  investment: {
    heading: string;
    sub: string;
    one_time: { label: string; price: string; was?: string; note: string };
    monthly: {
      label: string;
      price: string;
      rows: { label: string; detail: string; price: string }[];
    };
    ad_budget: { label: string; price: string; note: string };
    terms: string;
    calc: { monthly_total: number; ad_budget: number; default_job: number; note: string };
  };
  needs_heading: string;
  needs_sub: string;
  needs: { title: string; detail: string }[];
  steps_heading: string;
  steps: { title: string; detail: string }[];
  note: string;
  cta: { label: string; email: string; phone: string; phone_display: string };
}

export const SLIDE_LABELS = [
  "Title",
  "Pain Points",
  "Why New Website",
  "AIDA Strategy",
  "Itemized Pricing",
  "Competitors",
  "ROI",
  "Timeline",
  "Pricing Summary",
  "Next Steps",
];
