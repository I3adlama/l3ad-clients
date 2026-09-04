"use client";

import CheckboxGroup from "@/components/ui/CheckboxGroup";
import RadioGroup from "@/components/ui/RadioGroup";
import TextArea from "@/components/ui/TextArea";
import TextInput from "@/components/ui/TextInput";
import FileUpload from "@/components/ui/FileUpload";
import SectionWrapper from "../SectionWrapper";
import type { UploadedFile } from "@/lib/types";

const RECORD_OPTIONS = [
  { value: "Lead or inquiry log (calls, texts, form fills)", label: "Lead or inquiry log (calls, texts, form fills)" },
  { value: "Job or invoice history", label: "Job or invoice history" },
  { value: "Appointment or booking records", label: "Appointment or booking records" },
  { value: "Customer list or CRM", label: "Customer list or CRM" },
  { value: "Quotes and estimates sent", label: "Quotes and estimates sent" },
  { value: "Reviews and feedback collected", label: "Reviews and feedback collected" },
  { value: "Nothing organized yet", label: "Nothing organized yet" },
];

const LOCATION_OPTIONS = [
  { value: "Spreadsheet (Excel or Google Sheets)", label: "Spreadsheet (Excel or Google Sheets)" },
  { value: "Invoicing or field software (QuickBooks, Jobber, Housecall Pro...)", label: "Invoicing or field software (QuickBooks, Jobber, Housecall Pro...)" },
  { value: "CRM", label: "CRM" },
  { value: "Booking or scheduling software", label: "Booking or scheduling software" },
  { value: "Email inbox", label: "Email inbox" },
  { value: "Phone call log or texts", label: "Phone call log or texts" },
  { value: "Paper or notebook", label: "Paper or notebook" },
];

const VOLUME_OPTIONS = [
  { value: "under-10", label: "Under 10" },
  { value: "10-25", label: "10 to 25" },
  { value: "25-50", label: "25 to 50" },
  { value: "50-100", label: "50 to 100" },
  { value: "100-plus", label: "100+" },
  { value: "not-sure", label: "Not sure" },
];

const SHARE_OPTIONS = [
  { value: "upload-now", label: "Upload a file now" },
  { value: "fill-template", label: "Fill out your template" },
  { value: "give-access", label: "Give you access to my software" },
  { value: "call", label: "Walk through it on a call" },
  { value: "not-sharing", label: "I'd rather not share" },
];

const AGGREGATE_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "ask-first", label: "Ask me first each time" },
  { value: "no", label: "No" },
];

const TEMPLATE_COLUMNS: [string, string][] = [
  ["Date", "When they reached out"],
  ["What they asked for", "The service or problem, in their words"],
  ["How they found you", "Google, referral, Facebook, yard sign..."],
  ["Town or ZIP", "Where the job was"],
  ["Outcome", "Booked, quoted, or lost"],
  ["Job value", "Optional, even a rough number helps"],
];

interface YourDataData {
  records_kept?: string[];
  data_location?: string[];
  tools_used?: string;
  monthly_inquiries?: string;
  share_method?: string;
  uploads?: UploadedFile[];
  known_patterns?: string;
  aggregate_ok?: string;
}

interface Props {
  data: YourDataData;
  onChange: (data: YourDataData) => void;
  slug: string;
}

export default function YourDataStep({ data, onChange, slug }: Props) {
  function update<K extends keyof YourDataData>(field: K, value: YourDataData[K]) {
    onChange({ ...data, [field]: value });
  }

  const wantsUpload = data.share_method === "upload-now";

  return (
    <SectionWrapper
      title="Your Numbers"
      subtitle="The best content comes from what actually happens in your business, not guesses."
    >
      <p className="text-[var(--text-soft)] text-sm -mt-2">
        If we know that 4 out of 10 calls last quarter were about door repair, the website leads
        with door repair and the content strategy follows real demand. That is what this section is for.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <CheckboxGroup
          label="What records do you already keep?"
          options={RECORD_OPTIONS}
          selected={data.records_kept || []}
          onChange={(v) => update("records_kept", v)}
        />

        <CheckboxGroup
          label="Where does that information live?"
          options={LOCATION_OPTIONS}
          selected={data.data_location || []}
          onChange={(v) => update("data_location", v)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <TextInput
          label="Which tools or software, if any?"
          value={data.tools_used || ""}
          onChange={(v) => update("tools_used", v)}
          placeholder="QuickBooks, Jobber, a Google Sheet, my phone..."
          name="tools_used"
        />

        <RadioGroup
          label="Roughly how many inquiries do you get a month?"
          options={VOLUME_OPTIONS}
          selected={data.monthly_inquiries || ""}
          onChange={(v) => update("monthly_inquiries", v)}
        />
      </div>

      {/* Template: what we are looking for */}
      <div className="rounded-md border border-[var(--border-accent)] bg-accent/5 p-4">
        <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-2">
          What we&apos;re looking for
        </p>
        <p className="text-sm text-[var(--text-muted)] mb-3">
          A simple list of inquiries, one row each. Three months is plenty to start. You can export
          it from your software, copy it from a spreadsheet, or use our template.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 mb-4">
          {TEMPLATE_COLUMNS.map(([name, hint]) => (
            <div key={name} className="text-sm">
              <span className="text-white">{name}</span>
              <span className="text-[var(--text-soft)]"> · {hint}</span>
            </div>
          ))}
        </div>
        <a
          href="/templates/lead-log-template.csv"
          download
          className="inline-block text-sm font-ui tracking-wider uppercase text-accent hover:text-accent-bright"
        >
          Download the template (CSV)
        </a>
        <p className="text-xs text-[var(--text-soft)] mt-2">
          Names, phone numbers and addresses are not needed. We only use the totals.
        </p>
      </div>

      <RadioGroup
        label="How would you like to share it?"
        options={SHARE_OPTIONS}
        selected={data.share_method || ""}
        onChange={(v) => update("share_method", v)}
      />

      {(wantsUpload || (data.uploads && data.uploads.length > 0)) && (
        <FileUpload
          label="Upload your export or filled-in template"
          files={data.uploads || []}
          onChange={(f) => update("uploads", f)}
          slug={slug}
          max={5}
          accept=".csv,.xlsx,.xls,.pdf,image/*,.heic"
        />
      )}

      <TextArea
        label="What do you already know from your numbers?"
        value={data.known_patterns || ""}
        onChange={(v) => update("known_patterns", v)}
        placeholder="Most calls are about X. Busiest months. Where the best jobs come from. Anything you've noticed."
        name="known_patterns"
        minRows={3}
      />

      <RadioGroup
        label="Can we publish anonymized totals from your data? (Example: '4 out of 10 requests last quarter were door repairs.' Never names, addresses, or individual prices.)"
        options={AGGREGATE_OPTIONS}
        selected={data.aggregate_ok || ""}
        onChange={(v) => update("aggregate_ok", v)}
      />
    </SectionWrapper>
  );
}
