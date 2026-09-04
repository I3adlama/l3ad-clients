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
  ["Date", "when they reached out"],
  ["What they asked for", "in their words"],
  ["How they found you", "Google, referral, sign..."],
  ["Town or ZIP", "where the job was"],
  ["Outcome", "booked, quoted, lost"],
  ["Job value", "optional"],
];

const TEMPLATE_EXAMPLES: string[][] = [
  ["Aug 3", "Front door won't latch", "Google search", "Titusville 32796", "Booked", "$275"],
  ["Aug 5", "Drywall patch, two holes", "Referral", "Mims 32754", "Quoted", "$180"],
  ["Aug 9", "Fence install", "Facebook", "Cocoa 32922", "Lost", ""],
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

      <div className="space-y-5">
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

      <div className="space-y-5">
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
        <p className="text-base font-bold text-[var(--text)]">What we&apos;re looking for</p>
        <p className="text-sm text-[var(--text-muted)] mt-1 mb-3">
          One row per inquiry. Three months is plenty to start. Export it from your software, copy it
          from a spreadsheet, or fill in our template. It looks like this:
        </p>

        <div className="overflow-x-auto rounded-md border border-[var(--border-strong)] bg-white">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-noir-700">
                {TEMPLATE_COLUMNS.map(([name, hint]) => (
                  <th key={name} className="text-left align-top px-3 py-2 border-b border-[var(--border-strong)] whitespace-nowrap">
                    <span className="block font-bold text-[var(--text)]">{name}</span>
                    <span className="block text-xs font-normal text-[var(--text-soft)]">{hint}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TEMPLATE_EXAMPLES.map((row, i) => (
                <tr key={i} className={i % 2 ? "bg-noir-700" : ""}>
                  {row.map((cell, j) => (
                    <td key={j} className="px-3 py-2 whitespace-nowrap text-[var(--text-muted)] border-b border-[var(--border)]">
                      {cell || <span className="text-[var(--text-soft)]">&mdash;</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <a
            href="/templates/lead-log-template.csv"
            download
            className="form-download-link inline-block text-sm font-ui tracking-wider uppercase"
          >
            Download the template (CSV)
          </a>
          <p className="text-xs text-[var(--text-soft)] flex items-center gap-1.5">
            <i className="bi bi-lock-fill" aria-hidden="true" />
            No names, phone numbers, or addresses needed. We only use the totals.
          </p>
        </div>
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
