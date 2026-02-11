"use client";

import type { IntakeResponses } from "@/lib/types";
import NoirPanel from "@/components/ui/NoirPanel";

const STYLE_LABELS: Record<string, string> = {
  "clean-professional": "Clean & Professional",
  "bold-modern": "Bold & Modern",
  "warm-friendly": "Warm & Friendly",
  "rugged-industrial": "Rugged & Industrial",
  "earth-tones": "Earth Tones",
  "cool-professional": "Cool & Professional",
  "bold-energetic": "Bold & Energetic",
  "natural-fresh": "Natural & Fresh",
  "real-authentic": "Real & Authentic",
  "polished-professional": "Polished & Professional",
  "action-shots": "Action Shots",
  "before-after": "Before & After",
};

const MARGIN_LABELS: Record<string, string> = {
  budget: "Budget-friendly",
  "mid-range": "Mid-range",
  premium: "Premium",
};

const DARK_LIGHT_LABELS: Record<string, string> = {
  dark: "Dark & Bold",
  light: "Light & Clean",
  "no-preference": "No Preference",
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <h3 className="font-display text-xl text-accent mb-3 border-b border-[var(--border)] pb-2">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | string[] | boolean | null }) {
  if (value === undefined || value === null || value === "") return null;
  if (Array.isArray(value) && value.length === 0) return null;

  const display = typeof value === "boolean"
    ? (value ? "Yes" : "No")
    : Array.isArray(value)
      ? value.join(", ")
      : value;

  return (
    <div>
      <span className="text-[var(--text-soft)] text-sm">{label}</span>
      <p className="text-white mt-0.5">{display}</p>
    </div>
  );
}

interface ResponseBriefProps {
  responses: IntakeResponses;
}

export default function ResponseBrief({ responses }: ResponseBriefProps) {
  const { your_story, services, your_customers, your_brand, look_and_feel, content_media, website_features, goals } = responses;

  // Use your_brand if available, fall back to look_and_feel for old data
  const brandData = your_brand || look_and_feel;

  function copyAsText() {
    const lines: string[] = [];

    function addSection(title: string, fields: [string, string | string[] | boolean | undefined | null][]) {
      lines.push(`\n## ${title}`);
      for (const [label, value] of fields) {
        if (value === undefined || value === null || value === "") continue;
        if (Array.isArray(value) && value.length === 0) continue;
        const display = typeof value === "boolean"
          ? (value ? "Yes" : "No")
          : Array.isArray(value) ? value.join(", ") : value;
        lines.push(`${label}: ${display}`);
      }
    }

    addSection("Your Story", [
      ["How they got started", your_story?.how_started],
      ["Years in business", your_story?.years_in_business],
      ["Proud of", your_story?.proud_of],
      ["Differentiator", your_story?.differentiator],
    ]);

    addSection("Services", [
      ["Verified services", services?.verified_services],
      ["Additional services", services?.additional_services],
      ["Services offered", services?.main_services],
      ["Specialty", services?.specialty],
      ["Service area", services?.service_area],
      ["Wants pricing research", services?.wants_pricing_research],
      ["Target margin", services?.target_margin ? MARGIN_LABELS[services.target_margin] || services.target_margin : undefined],
    ]);

    addSection("Customers", [
      ["Ideal customer", your_customers?.ideal_customer],
      ["How they find them", your_customers?.how_they_find_you],
      ["Wants more of", your_customers?.want_more_of],
    ]);

    addSection("Brand", [
      ["Dark/Light preference", your_brand?.dark_or_light ? DARK_LIGHT_LABELS[your_brand.dark_or_light] || your_brand.dark_or_light : undefined],
      ["Brand personality", your_brand?.brand_personality],
      ["Has brand colors", your_brand?.has_brand_colors],
      ["Brand colors", your_brand?.brand_colors],
      ["Website style", brandData && "website_style" in brandData && brandData.website_style ? STYLE_LABELS[brandData.website_style] || brandData.website_style : undefined],
      ["Color mood", brandData && "color_mood" in brandData && brandData.color_mood ? STYLE_LABELS[brandData.color_mood] || brandData.color_mood : undefined],
      ["Inspiration URLs", your_brand?.inspiration_urls],
      ["Uploaded files", your_brand?.uploads?.map(f => f.filename)],
    ]);

    addSection("Content & Media", [
      ["Has existing website", content_media?.has_existing_website],
      ["Existing website URL", content_media?.existing_website_url],
      ["Has photos", content_media?.has_photos],
      ["Photo style", content_media?.photo_style ? STYLE_LABELS[content_media.photo_style] || content_media.photo_style : undefined],
      ["Has logo", content_media?.has_logo],
      ["Has videos", content_media?.has_videos],
      ["Work photos uploaded", content_media?.work_photo_uploads?.map(f => f.filename)],
      ["Other content", content_media?.other_content],
    ]);

    addSection("Website Features", [
      ["Needed features", website_features?.needed_features],
      ["Other features", website_features?.other_features],
    ]);

    addSection("Goals", [
      ["Primary goal", goals?.primary_goal],
      ["Timeline", goals?.timeline],
      ["Websites admired", goals?.websites_admired],
      ["Competitor URL", goals?.competitor_url],
      ["Other notes", goals?.anything_else],
    ]);

    navigator.clipboard.writeText(lines.join("\n"));
  }

  return (
    <NoirPanel className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl">Project Brief</h2>
        <button
          onClick={copyAsText}
          className="text-accent text-sm font-ui tracking-wider uppercase hover:text-accent-bright"
        >
          Copy as Text
        </button>
      </div>

      {your_story && (
        <Section title="Their Story">
          <Field label="How they got started" value={your_story.how_started} />
          <Field label="Years in business" value={your_story.years_in_business} />
          <Field label="Proud of" value={your_story.proud_of} />
          <Field label="What makes them different" value={your_story.differentiator} />
        </Section>
      )}

      {services && (
        <Section title="Services">
          {services.verified_services && services.verified_services.length > 0 && (
            <div>
              <span className="text-[var(--text-soft)] text-sm">Verified services</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {services.verified_services.map((s, i) => (
                  <span key={i} className="text-xs bg-green-400/10 text-green-400 border border-green-400/30 px-2 py-1 rounded">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          {services.additional_services && services.additional_services.length > 0 && (
            <div>
              <span className="text-[var(--text-soft)] text-sm">Additional services</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {services.additional_services.map((s, i) => (
                  <span key={i} className="text-xs bg-accent/10 text-accent px-2 py-1 rounded">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          <Field label="Services offered" value={services.main_services} />
          <Field label="Specialty" value={services.specialty} />
          <Field label="Service area" value={services.service_area} />
          {services.wants_pricing_research && (
            <div className="bg-accent/5 border border-[var(--border-accent)] rounded-md p-3">
              <span className="text-accent text-sm font-bold">Pricing Research Requested</span>
              {services.target_margin && (
                <p className="text-white text-sm mt-1">
                  Target: {MARGIN_LABELS[services.target_margin] || services.target_margin}
                </p>
              )}
            </div>
          )}
        </Section>
      )}

      {your_customers && (
        <Section title="Customers">
          <Field label="Ideal customer" value={your_customers.ideal_customer} />
          <Field label="How customers find them" value={your_customers.how_they_find_you} />
          <Field label="Wants more of" value={your_customers.want_more_of} />
        </Section>
      )}

      {/* Brand section — supports both your_brand and legacy look_and_feel */}
      {(your_brand || look_and_feel) && (
        <Section title="Brand">
          {your_brand?.dark_or_light && (
            <Field
              label="Theme preference"
              value={DARK_LIGHT_LABELS[your_brand.dark_or_light] || your_brand.dark_or_light}
            />
          )}

          {your_brand?.brand_personality && your_brand.brand_personality.length > 0 && (
            <div>
              <span className="text-[var(--text-soft)] text-sm">Brand personality</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {your_brand.brand_personality.map((word, i) => (
                  <span key={i} className="text-xs bg-accent/10 text-accent px-2 py-1 rounded font-bold">
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}

          {your_brand?.brand_colors && your_brand.brand_colors.length > 0 && (
            <div>
              <span className="text-[var(--text-soft)] text-sm">Brand colors</span>
              <div className="flex items-center gap-2 mt-1">
                {your_brand.brand_colors.map((color, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span
                      className="w-6 h-6 rounded-full border border-[var(--border)]"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs text-[var(--text-soft)]">{color}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Field
            label="Website style"
            value={brandData && "website_style" in brandData && brandData.website_style
              ? STYLE_LABELS[brandData.website_style] || brandData.website_style
              : undefined}
          />
          <Field
            label="Color mood"
            value={brandData && "color_mood" in brandData && brandData.color_mood
              ? STYLE_LABELS[brandData.color_mood] || brandData.color_mood
              : undefined}
          />

          {/* Legacy photo_style from look_and_feel */}
          {look_and_feel?.photo_style && !your_brand && (
            <Field
              label="Photo style"
              value={STYLE_LABELS[look_and_feel.photo_style] || look_and_feel.photo_style}
            />
          )}

          {your_brand?.inspiration_urls && your_brand.inspiration_urls.length > 0 && (
            <div>
              <span className="text-[var(--text-soft)] text-sm">Inspiration URLs</span>
              <div className="space-y-1 mt-1">
                {your_brand.inspiration_urls.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-accent text-sm truncate hover:text-accent-bright"
                  >
                    {url}
                  </a>
                ))}
              </div>
            </div>
          )}

          {your_brand?.uploads && your_brand.uploads.length > 0 && (
            <div>
              <span className="text-[var(--text-soft)] text-sm">Uploaded references</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {your_brand.uploads.map((file, i) => (
                  <a key={i} href={file.url} target="_blank" rel="noopener noreferrer">
                    {file.content_type.startsWith("image/") ? (
                      <img
                        src={file.url}
                        alt={file.filename}
                        className="w-16 h-16 object-cover rounded border border-[var(--border)] hover:border-accent transition-colors"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded border border-[var(--border)] bg-noir-700 flex items-center justify-center hover:border-accent transition-colors">
                        <span className="text-[var(--text-soft)] text-[10px]">
                          {file.filename.split(".").pop()?.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}
        </Section>
      )}

      {content_media && (
        <Section title="Content & Media">
          {content_media.has_existing_website && (
            <Field label="Existing website" value={content_media.existing_website_url} />
          )}
          <Field label="Has photos" value={content_media.has_photos} />
          {content_media.photo_style && (
            <Field
              label="Photo style"
              value={STYLE_LABELS[content_media.photo_style] || content_media.photo_style}
            />
          )}
          <Field label="Has logo" value={content_media.has_logo} />
          <Field label="Has videos" value={content_media.has_videos} />

          {content_media.work_photo_uploads && content_media.work_photo_uploads.length > 0 && (
            <div>
              <span className="text-[var(--text-soft)] text-sm">Work photos</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {content_media.work_photo_uploads.map((file, i) => (
                  <a key={i} href={file.url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={file.url}
                      alt={file.filename}
                      className="w-16 h-16 object-cover rounded border border-[var(--border)] hover:border-accent transition-colors"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          <Field label="Other content" value={content_media.other_content} />
        </Section>
      )}

      {website_features && (
        <Section title="Website Features">
          <Field label="Needed features" value={website_features.needed_features} />
          <Field label="Other features" value={website_features.other_features} />
        </Section>
      )}

      {goals && (
        <Section title="Goals">
          <Field label="Primary goal" value={goals.primary_goal} />
          <Field label="Timeline" value={goals.timeline} />
          <Field label="Websites admired" value={goals.websites_admired} />
          {goals.competitor_url && (
            <div>
              <span className="text-[var(--text-soft)] text-sm">Competitor</span>
              <a
                href={goals.competitor_url.startsWith("http") ? goals.competitor_url : `https://${goals.competitor_url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-accent text-sm truncate hover:text-accent-bright mt-0.5"
              >
                {goals.competitor_url}
              </a>
            </div>
          )}
          <Field label="Other notes" value={goals.anything_else} />
        </Section>
      )}
    </NoirPanel>
  );
}
