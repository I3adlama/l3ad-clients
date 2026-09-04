import "server-only";
import { Resend } from "resend";
import type { IntakeResponses } from "./types";

/**
 * Admin notifications via Resend.
 * The sender address is taken from RESEND_FROM_EMAIL; the display name is replaced
 * so intake mail is not branded as another client's event form.
 */

function senderAddress(): string | null {
  const raw = process.env.RESEND_FROM_EMAIL;
  if (!raw) return null;
  const match = raw.match(/<([^>]+)>/);
  const email = (match ? match[1] : raw).trim();
  return `L3ad Clients <${email}>`;
}

function recipient(): string | null {
  return (
    process.env.INTAKE_NOTIFICATION_EMAIL ||
    process.env.MEMORIAL_DAY_NOTIFICATION_EMAIL ||
    null
  );
}

function line(label: string, value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    const items = value.map((v) =>
      v && typeof v === "object" && "filename" in (v as object)
        ? `${(v as { filename: string }).filename} (${(v as { url: string }).url})`
        : String(v)
    );
    return `${label}: ${items.join(", ")}`;
  }
  if (typeof value === "boolean") return `${label}: ${value ? "Yes" : "No"}`;
  return `${label}: ${String(value)}`;
}

function summarizeResponses(r: IntakeResponses): string {
  const sections: [string, (string | null)[]][] = [
    ["Their Story", [
      line("How they got started", r.your_story?.how_started),
      line("Years in business", r.your_story?.years_in_business),
      line("Proud of", r.your_story?.proud_of),
      line("Differentiator", r.your_story?.differentiator),
    ]],
    ["Services", [
      line("Verified services", r.services?.verified_services),
      line("Additional services", r.services?.additional_services),
      line("Specialty", r.services?.specialty),
      line("Service area", r.services?.service_area),
      line("Wants pricing research", r.services?.wants_pricing_research),
      line("Target margin", r.services?.target_margin),
    ]],
    ["Customers", [
      line("Ideal customer", r.your_customers?.ideal_customer),
      line("How they find them", r.your_customers?.how_they_find_you),
      line("Wants more of", r.your_customers?.want_more_of),
    ]],
    ["Brand", [
      line("Dark or light", r.your_brand?.dark_or_light),
      line("Personality", r.your_brand?.brand_personality),
      line("Brand colors", r.your_brand?.brand_colors),
      line("Website style", r.your_brand?.website_style),
      line("Color mood", r.your_brand?.color_mood),
      line("Inspiration URLs", r.your_brand?.inspiration_urls),
      line("Uploads", r.your_brand?.uploads),
    ]],
    ["Content & Media", [
      line("Existing website", r.content_media?.existing_website_url),
      line("Has photos", r.content_media?.has_photos),
      line("Photo style", r.content_media?.photo_style),
      line("Has logo", r.content_media?.has_logo),
      line("Has videos", r.content_media?.has_videos),
      line("Work photos", r.content_media?.work_photo_uploads),
      line("Other content", r.content_media?.other_content),
    ]],
    ["Special Requests", [
      line("Features", r.website_features?.needed_features),
      line("Other", r.website_features?.other_features),
    ]],
    ["Goals", [
      line("Primary goal", r.goals?.primary_goal),
      line("Timeline", r.goals?.timeline),
      line("Websites admired", r.goals?.websites_admired),
      line("Competitor", r.goals?.competitor_url),
      line("Anything else", r.goals?.anything_else),
    ]],
  ];

  return sections
    .map(([title, lines]) => {
      const body = lines.filter((l): l is string => !!l);
      return body.length ? `${title}\n${body.map((l) => `  ${l}`).join("\n")}` : null;
    })
    .filter(Boolean)
    .join("\n\n");
}

export async function notifyIntakeCompleted(input: {
  clientName: string;
  projectId: string;
  responses: IntakeResponses;
  origin: string;
}): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = senderAddress();
  const to = recipient();

  if (!apiKey || !from || !to) {
    console.warn("[notify] intake notification skipped: RESEND_API_KEY, RESEND_FROM_EMAIL or a notification address is missing");
    return { sent: false, reason: "email not configured" };
  }

  const adminUrl = `${input.origin}/admin/projects/${input.projectId}`;
  const text = [
    `${input.clientName} just completed their intake form.`,
    ``,
    `Review it here: ${adminUrl}`,
    ``,
    summarizeResponses(input.responses) || "(no answers were filled in)",
  ].join("\n");

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      subject: `Intake completed: ${input.clientName}`,
      text,
    });
    if (error) {
      console.error("[notify] Resend error:", error);
      return { sent: false, reason: error.message };
    }
    return { sent: true };
  } catch (err) {
    console.error("[notify] intake notification failed:", err);
    return { sent: false, reason: err instanceof Error ? err.message : "unknown error" };
  }
}
