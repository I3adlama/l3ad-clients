export interface Project {
  id: string;
  slug: string;
  client_name: string;
  business_type: string | null;
  location: string | null;
  social_urls: SocialUrl[];
  notes: string | null;
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

export interface CreateProjectPayload {
  client_name: string;
  business_type?: string;
  location?: string;
  social_urls?: SocialUrl[];
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
