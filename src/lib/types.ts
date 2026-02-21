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
  "your_brand",
  "content_media",
  "website_features",
  "goals",
];

export const STEP_LABELS = [
  "Your Story",
  "Services",
  "Your Customers",
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

  /** Slide 3: Why New Website */
  why_new_website: {
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
    }[];
    unfair_advantage: string;
  };

  /** Slide 7: ROI */
  roi: {
    monthly_cost: string;
    revenue_per_customer: string;
    new_customers_per_month: string;
    monthly_revenue: string;
    annual_revenue: string;
    roi_percentage: string;
    projections?: {
      month: string;
      orders: string;
      revenue: string;
      cumulative: string;
    }[];
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
