"use client";

import { useState } from "react";
import TextInput from "@/components/ui/TextInput";
import TextArea from "@/components/ui/TextArea";
import RadioGroup from "@/components/ui/RadioGroup";
import BevelButton from "@/components/ui/BevelButton";

const VENDOR_CATEGORIES = [
  "Food Truck",
  "Prepared Food",
  "Crafts & Handmade",
  "Retail Merchandise",
  "Services",
  "Other",
] as const;

const BOOTH_SIZES = [
  "Standard 10x10",
  "Larger (specify in notes)",
  "Food Truck (specify length in notes)",
] as const;

interface FormState {
  business_name: string;
  contact_name: string;
  phone: string;
  email: string;
  selling: string;
  category: string;
  booth_size: string;
  needs_electric: string;
  brings_own_setup: string;
  social_link: string;
  notes: string;
  payment_ack: boolean;
  honeypot: string;
}

const initialState: FormState = {
  business_name: "",
  contact_name: "",
  phone: "",
  email: "",
  selling: "",
  category: "",
  booth_size: "",
  needs_electric: "",
  brings_own_setup: "",
  social_link: "",
  notes: "",
  payment_ack: false,
  honeypot: "",
};

type Errors = Partial<Record<keyof FormState, string>>;

export default function VendorApplicationForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  function validate(): Errors {
    const e: Errors = {};
    if (!form.business_name.trim()) e.business_name = "Required";
    if (!form.contact_name.trim()) e.contact_name = "Required";
    if (!form.phone.trim()) e.phone = "Required";
    if (!form.email.trim()) {
      e.email = "Required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      e.email = "Enter a valid email";
    }
    if (!form.selling.trim()) e.selling = "Required";
    if (!form.category) e.category = "Pick a category";
    if (!form.booth_size) e.booth_size = "Pick a booth size";
    if (!form.needs_electric) e.needs_electric = "Required";
    if (!form.brings_own_setup) e.brings_own_setup = "Required";
    if (!form.payment_ack) e.payment_ack = "Please acknowledge the $50 fee";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstKey = Object.keys(validationErrors)[0];
      document.getElementById(firstKey)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/events/memorial-day-bash-vendor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        throw new Error(`Submit failed (${res.status})`);
      }
      setSubmitted(true);
    } catch (err) {
      console.error("Vendor application submit failed:", err);
      setServerError(
        "Something went wrong sending your application. Please try again, or text us if it keeps failing."
      );
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-[#00f0d0]/10 border-2 border-[#00f0d0] rounded-full flex items-center justify-center mx-auto mb-6">
          <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
            <path
              d="M2 11L10 19L26 3"
              stroke="#00f0d0"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl mb-3">
          Application received
        </h2>
        <p className="text-[var(--text-muted)] mb-2">
          Thanks {form.contact_name.split(" ")[0] || "for applying"}. We&apos;ll
          review your application within 24 hours and email you with next steps.
        </p>
        <p className="text-[var(--text-soft)] text-sm">
          Check your inbox for a confirmation from Legacies NY Deli.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <h2 className="font-display text-2xl sm:text-3xl">Apply for a Spot</h2>
        <p className="text-[var(--text-soft)] text-sm mt-1">
          Takes about 2 minutes. Required fields marked with{" "}
          <span className="text-accent">*</span>.
        </p>
      </div>

      <input
        type="text"
        name="company_website"
        value={form.honeypot}
        onChange={(e) => update("honeypot", e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        style={{
          position: "absolute",
          left: "-9999px",
          width: "1px",
          height: "1px",
          opacity: 0,
        }}
        aria-hidden="true"
      />

      <FieldError error={errors.business_name}>
        <TextInput
          label="Business or Vendor Name"
          name="business_name"
          value={form.business_name}
          onChange={(v) => update("business_name", v)}
          required
        />
      </FieldError>

      <FieldError error={errors.contact_name}>
        <TextInput
          label="Your Name"
          name="contact_name"
          value={form.contact_name}
          onChange={(v) => update("contact_name", v)}
          required
        />
      </FieldError>

      <FieldError error={errors.phone}>
        <div>
          <label className="input-label" htmlFor="phone">
            Phone Number <span className="text-accent ml-1">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className="input-field"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="(555) 555-5555"
            required
          />
        </div>
      </FieldError>

      <FieldError error={errors.email}>
        <div>
          <label className="input-label" htmlFor="email">
            Email <span className="text-accent ml-1">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="input-field"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
      </FieldError>

      <FieldError error={errors.selling}>
        <TextArea
          label="What are you selling? Be specific."
          name="selling"
          value={form.selling}
          onChange={(v) => update("selling", v)}
          placeholder="e.g. Handmade leather wallets and belts, hot dogs and burgers, custom T-shirts..."
        />
      </FieldError>

      <FieldError error={errors.category}>
        <div>
          <label className="input-label" htmlFor="category">
            Vendor Category <span className="text-accent ml-1">*</span>
          </label>
          <select
            id="category"
            name="category"
            className="input-field"
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            required
          >
            <option value="">Select one...</option>
            {VENDOR_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </FieldError>

      <FieldError error={errors.booth_size}>
        <div>
          <label className="input-label" htmlFor="booth_size">
            Booth Size Needed <span className="text-accent ml-1">*</span>
          </label>
          <select
            id="booth_size"
            name="booth_size"
            className="input-field"
            value={form.booth_size}
            onChange={(e) => update("booth_size", e.target.value)}
            required
          >
            <option value="">Select one...</option>
            {BOOTH_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </FieldError>

      <FieldError error={errors.needs_electric}>
        <div id="needs_electric">
          <RadioGroup
            label="Do you need electrical access? *"
            options={[
              { value: "Yes", label: "Yes" },
              { value: "No", label: "No" },
            ]}
            selected={form.needs_electric}
            onChange={(v) => update("needs_electric", v)}
          />
        </div>
      </FieldError>

      <FieldError error={errors.brings_own_setup}>
        <div id="brings_own_setup">
          <RadioGroup
            label="Will you bring your own tent, table, and chairs? *"
            options={[
              { value: "Yes", label: "Yes" },
              { value: "No", label: "No" },
              { value: "Need to rent", label: "Need to rent" },
            ]}
            selected={form.brings_own_setup}
            onChange={(v) => update("brings_own_setup", v)}
          />
        </div>
      </FieldError>

      <TextInput
        label="Facebook or Instagram link"
        name="social_link"
        value={form.social_link}
        onChange={(v) => update("social_link", v)}
        placeholder="Optional"
      />

      <TextArea
        label="Anything else we should know?"
        name="notes"
        value={form.notes}
        onChange={(v) => update("notes", v)}
        placeholder="Optional — special requests, food truck length, allergies you'll be near, etc."
      />

      <FieldError error={errors.payment_ack}>
        <label
          htmlFor="payment_ack"
          className="flex gap-3 items-start cursor-pointer p-4 border border-[var(--border)] rounded-md hover:border-[var(--border-strong)] transition-colors"
        >
          <input
            id="payment_ack"
            name="payment_ack"
            type="checkbox"
            checked={form.payment_ack}
            onChange={(e) => update("payment_ack", e.target.checked)}
            className="mt-1 w-4 h-4 accent-[#00f0d0]"
          />
          <span className="text-sm text-[var(--text-muted)]">
            I understand the $50 vendor fee is due upon approval to secure my
            spot. Payment via Zelle or CashApp.{" "}
            <span className="text-accent">*</span>
          </span>
        </label>
      </FieldError>

      <div className="pt-2 flex flex-col items-center gap-3">
        <BevelButton type="submit" disabled={submitting} size="lg">
          {submitting ? "Submitting..." : "Submit Application"}
        </BevelButton>
        {serverError && (
          <p className="text-red-400 text-sm text-center">{serverError}</p>
        )}
      </div>
    </form>
  );
}

function FieldError({
  error,
  children,
}: {
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      {children}
      {error && (
        <p className="text-red-400 text-xs mt-1.5 font-ui">{error}</p>
      )}
    </div>
  );
}
