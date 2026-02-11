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

function Field({ label, value }: { label: string; value?: string | string[] | null }) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;

  const display = Array.isArray(value) ? value.join(", ") : value;

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
  const { your_story, services, your_customers, look_and_feel, content_media, website_features, goals } = responses;

  function copyAsText() {
    const lines: string[] = [];

    function addSection(title: string, fields: [string, string | string[] | undefined | null][]) {
      lines.push(`\n## ${title}`);
      for (const [label, value] of fields) {
        if (!value || (Array.isArray(value) && value.length === 0)) continue;
        const display = Array.isArray(value) ? value.join(", ") : value;
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
      ["Services offered", services?.main_services],
      ["Specialty", services?.specialty],
      ["Service area", services?.service_area],
    ]);

    addSection("Customers", [
      ["Ideal customer", your_customers?.ideal_customer],
      ["How they find them", your_customers?.how_they_find_you],
      ["Wants more of", your_customers?.want_more_of],
    ]);

    addSection("Look & Feel", [
      ["Website style", look_and_feel?.website_style ? STYLE_LABELS[look_and_feel.website_style] || look_and_feel.website_style : undefined],
      ["Color mood", look_and_feel?.color_mood ? STYLE_LABELS[look_and_feel.color_mood] || look_and_feel.color_mood : undefined],
      ["Photo style", look_and_feel?.photo_style ? STYLE_LABELS[look_and_feel.photo_style] || look_and_feel.photo_style : undefined],
    ]);

    addSection("Content & Media", [
      ["Has photos", content_media?.has_photos],
      ["Has logo", content_media?.has_logo],
      ["Has videos", content_media?.has_videos],
      ["Other content", content_media?.other_content],
    ]);

    addSection("Website Features", [
      ["Needed features", website_features?.needed_features],
      ["Other features", website_features?.other_features],
    ]);

    addSection("Goals", [
      ["Primary goal", goals?.primary_goal],
      ["Timeline", goals?.timeline],
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
          <Field label="Services offered" value={services.main_services} />
          <Field label="Specialty" value={services.specialty} />
          <Field label="Service area" value={services.service_area} />
        </Section>
      )}

      {your_customers && (
        <Section title="Customers">
          <Field label="Ideal customer" value={your_customers.ideal_customer} />
          <Field label="How customers find them" value={your_customers.how_they_find_you} />
          <Field label="Wants more of" value={your_customers.want_more_of} />
        </Section>
      )}

      {look_and_feel && (
        <Section title="Look & Feel">
          <Field
            label="Website style"
            value={look_and_feel.website_style ? STYLE_LABELS[look_and_feel.website_style] || look_and_feel.website_style : undefined}
          />
          <Field
            label="Color mood"
            value={look_and_feel.color_mood ? STYLE_LABELS[look_and_feel.color_mood] || look_and_feel.color_mood : undefined}
          />
          <Field
            label="Photo style"
            value={look_and_feel.photo_style ? STYLE_LABELS[look_and_feel.photo_style] || look_and_feel.photo_style : undefined}
          />
        </Section>
      )}

      {content_media && (
        <Section title="Content & Media">
          <Field label="Has photos" value={content_media.has_photos} />
          <Field label="Has logo" value={content_media.has_logo} />
          <Field label="Has videos" value={content_media.has_videos} />
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
          <Field label="Other notes" value={goals.anything_else} />
        </Section>
      )}
    </NoirPanel>
  );
}
