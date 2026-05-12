import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";

const VendorApplicationSchema = z.object({
  business_name: z.string().trim().min(1).max(200),
  contact_name: z.string().trim().min(1).max(200),
  phone: z.string().trim().min(7).max(40),
  email: z.string().trim().email().max(254),
  selling: z.string().trim().min(1).max(2000),
  category: z.enum([
    "Food Truck",
    "Prepared Food",
    "Crafts & Handmade",
    "Retail Merchandise",
    "Services",
    "Other",
  ]),
  booth_size: z.enum([
    "Standard 10x10",
    "Larger (specify in notes)",
    "Food Truck (specify length in notes)",
  ]),
  needs_electric: z.enum(["Yes", "No"]),
  brings_own_setup: z.enum(["Yes", "No", "Need to rent"]),
  social_link: z.string().trim().max(500).optional().default(""),
  notes: z.string().trim().max(2000).optional().default(""),
  payment_ack: z.literal(true),
  honeypot: z.string().max(0).optional().default(""),
});

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Silently accept honeypot hits so bots don't get a useful signal
  const honeypotValue =
    typeof body === "object" && body !== null && "honeypot" in body
      ? (body as Record<string, unknown>).honeypot
      : "";
  if (typeof honeypotValue === "string" && honeypotValue.length > 0) {
    return NextResponse.json({ success: true });
  }

  const parsed = VendorApplicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form and try again." },
      { status: 400 }
    );
  }
  const data = parsed.data;

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const notificationEmail = process.env.MEMORIAL_DAY_NOTIFICATION_EMAIL;

  if (!apiKey || !fromEmail || !notificationEmail) {
    console.error("Vendor application: missing email env vars");
    return NextResponse.json(
      { error: "Email service is not configured." },
      { status: 500 }
    );
  }

  const resend = new Resend(apiKey);

  const adminTextLines = [
    `New vendor application for Legacies Memorial Day Bash (May 23, 2026).`,
    ``,
    `Business or Vendor Name: ${data.business_name}`,
    `Contact Name: ${data.contact_name}`,
    `Phone: ${data.phone}`,
    `Email: ${data.email}`,
    ``,
    `What they're selling:`,
    data.selling,
    ``,
    `Vendor Category: ${data.category}`,
    `Booth Size: ${data.booth_size}`,
    `Needs electrical: ${data.needs_electric}`,
    `Brings own tent/table/chairs: ${data.brings_own_setup}`,
    ``,
    `Social link: ${data.social_link || "(not provided)"}`,
    ``,
    `Notes:`,
    data.notes || "(none)",
    ``,
    `Payment acknowledged: Yes`,
  ];
  const adminText = adminTextLines.join("\n");

  const row = (label: string, value: string) =>
    `<tr><td style="padding:6px 12px 6px 0;color:#666;vertical-align:top;white-space:nowrap;">${escapeHtml(
      label
    )}</td><td style="padding:6px 0;">${escapeHtml(value).replace(/\n/g, "<br>")}</td></tr>`;
  const adminHtml = `
    <div style="font-family: -apple-system, system-ui, sans-serif; max-width: 600px;">
      <h2 style="margin:0 0 4px 0;">New Vendor Application</h2>
      <p style="margin:0 0 16px 0;color:#666;">Legacies Memorial Day Bash — Saturday, May 23, 2026</p>
      <table style="border-collapse:collapse;width:100%;font-size:14px;">
        ${row("Business", data.business_name)}
        ${row("Contact", data.contact_name)}
        ${row("Phone", data.phone)}
        ${row("Email", data.email)}
        ${row("Selling", data.selling)}
        ${row("Category", data.category)}
        ${row("Booth size", data.booth_size)}
        ${row("Electrical", data.needs_electric)}
        ${row("Own setup", data.brings_own_setup)}
        ${row("Social", data.social_link || "(not provided)")}
        ${row("Notes", data.notes || "(none)")}
        ${row("Payment ack", "Yes")}
      </table>
    </div>
  `;

  const applicantText = [
    `Hi ${data.contact_name.split(" ")[0] || "there"},`,
    ``,
    `Thanks for applying to be a vendor at the Legacies 1st Annual Memorial Day Bash on Saturday, May 23, 2026 in Titusville, FL.`,
    ``,
    `We've received your application for ${data.business_name} and will review it within 24 hours. If you're approved, we'll send you payment details to lock in your spot — $50 via Zelle or CashApp.`,
    ``,
    `Spots are first come, first served, and only paid spots are locked in, so keep an eye on your inbox.`,
    ``,
    `If you have any questions in the meantime, just reply to this email.`,
    ``,
    `Talk soon,`,
    `Legacies NY Deli`,
  ].join("\n");

  const applicantHtml = `
    <div style="font-family: -apple-system, system-ui, sans-serif; max-width: 600px; line-height: 1.5;">
      <p>Hi ${escapeHtml(data.contact_name.split(" ")[0] || "there")},</p>
      <p>Thanks for applying to be a vendor at the <strong>Legacies 1st Annual Memorial Day Bash</strong> on Saturday, May 23, 2026 in Titusville, FL.</p>
      <p>We've received your application for <strong>${escapeHtml(data.business_name)}</strong> and will review it within 24 hours. If you're approved, we'll send you payment details to lock in your spot — <strong>$50 via Zelle or CashApp</strong>.</p>
      <p>Spots are first come, first served, and only paid spots are locked in, so keep an eye on your inbox.</p>
      <p>If you have any questions in the meantime, just reply to this email.</p>
      <p style="margin-top:24px;">Talk soon,<br>Legacies NY Deli</p>
    </div>
  `;

  try {
    const [adminResult, applicantResult] = await Promise.all([
      resend.emails.send({
        from: fromEmail,
        to: notificationEmail,
        replyTo: data.email,
        subject: `New Vendor Application - Memorial Day Bash - ${data.business_name}`,
        text: adminText,
        html: adminHtml,
      }),
      resend.emails.send({
        from: fromEmail,
        to: data.email,
        subject: "We received your vendor application - Legacies Memorial Day Bash",
        text: applicantText,
        html: applicantHtml,
      }),
    ]);

    if (adminResult.error) {
      console.error("Vendor application: admin email failed", adminResult.error);
      return NextResponse.json(
        { error: "We couldn't deliver your application. Please try again." },
        { status: 500 }
      );
    }
    if (applicantResult.error) {
      // Admin email succeeded — log the confirmation failure but treat the
      // submission as successful so the applicant isn't blocked.
      console.error(
        "Vendor application: applicant confirmation failed",
        applicantResult.error
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Vendor application send failed:", err);
    return NextResponse.json(
      { error: "We couldn't deliver your application. Please try again." },
      { status: 500 }
    );
  }
}
