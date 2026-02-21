"use client";

import { useState } from "react";
import RadioGroup from "@/components/ui/RadioGroup";
import TextArea from "@/components/ui/TextArea";
import TextInput from "@/components/ui/TextInput";
import FileUpload from "@/components/ui/FileUpload";
import SectionWrapper from "../SectionWrapper";
import StylePicker, { PhotoStylePreview } from "../StylePicker";
import type { UploadedFile } from "@/lib/types";

const PHOTO_STYLES = [
  {
    value: "real-authentic",
    label: "Real & Authentic",
    description: "Real photos of your actual work, no stock images",
    preview: <PhotoStylePreview iconClass="bi-camera-fill" bgClass="bg-amber-900/30" />,
  },
  {
    value: "polished-professional",
    label: "Polished & Professional",
    description: "Clean, well-lit, magazine quality shots",
    preview: <PhotoStylePreview iconClass="bi-stars" bgClass="bg-blue-900/30" />,
  },
  {
    value: "action-shots",
    label: "Action Shots",
    description: "Your team in action, on the job site",
    preview: <PhotoStylePreview iconClass="bi-hammer" bgClass="bg-orange-900/30" />,
  },
  {
    value: "before-after",
    label: "Before & After",
    description: "Show the transformation, the results",
    preview: <PhotoStylePreview iconClass="bi-arrow-repeat" bgClass="bg-green-900/30" />,
  },
];

interface ContentMediaData {
  has_photos?: string;
  has_logo?: string;
  has_videos?: string;
  photo_style?: string;
  has_existing_website?: boolean;
  existing_website_url?: string;
  work_photo_uploads?: UploadedFile[];
  other_content?: string;
}

interface Props {
  data: ContentMediaData;
  onChange: (data: ContentMediaData) => void;
  slug: string;
}

export default function ContentMediaStep({ data, onChange, slug }: Props) {
  const [hasWebsite, setHasWebsite] = useState(data.has_existing_website ?? false);

  function update<K extends keyof ContentMediaData>(field: K, value: ContentMediaData[K]) {
    onChange({ ...data, [field]: value });
  }

  return (
    <SectionWrapper
      title="Content & Media"
      subtitle="What do you already have that we can work with?"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Existing website */}
        <div>
          <span className="input-label">Do you have an existing website?</span>
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={() => {
                setHasWebsite(true);
                update("has_existing_website", true);
              }}
              className={`px-4 py-2 rounded-md border text-sm transition-colors ${
                hasWebsite
                  ? "border-[var(--border-accent)] bg-accent/5 text-white"
                  : "border-[var(--border)] bg-noir-800 text-[var(--text-muted)] hover:border-[var(--border-strong)]"
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => {
                setHasWebsite(false);
                update("has_existing_website", false);
                update("existing_website_url", "");
              }}
              className={`px-4 py-2 rounded-md border text-sm transition-colors ${
                !hasWebsite && data.has_existing_website !== undefined
                  ? "border-[var(--border-accent)] bg-accent/5 text-white"
                  : "border-[var(--border)] bg-noir-800 text-[var(--text-muted)] hover:border-[var(--border-strong)]"
              }`}
            >
              No
            </button>
          </div>
          {hasWebsite && (
            <div className="mt-3">
              <TextInput
                label="What's the URL?"
                value={data.existing_website_url || ""}
                onChange={(v) => update("existing_website_url", v)}
                placeholder="https://your-current-site.com"
                name="existing_website_url"
              />
            </div>
          )}
        </div>

        <RadioGroup
          label="Do you have photos of your work?"
          options={[
            { value: "tons", label: "Tons — I take pics of everything" },
            { value: "some", label: "Some — a few on my phone" },
            { value: "not-really", label: "Not really" },
          ]}
          selected={data.has_photos || ""}
          onChange={(v) => update("has_photos", v)}
        />
      </div>

      <StylePicker
        label="What kind of photos represent your work best?"
        options={PHOTO_STYLES}
        selected={data.photo_style || ""}
        onSelect={(v) => update("photo_style", v)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <RadioGroup
          label="Do you have a logo?"
          options={[
            { value: "yes", label: "Yes" },
            { value: "sort-of", label: "Sort of — could use a refresh" },
            { value: "no", label: "No" },
          ]}
          selected={data.has_logo || ""}
          onChange={(v) => update("has_logo", v)}
        />

        <RadioGroup
          label="Any videos of your work or team?"
          options={[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ]}
          selected={data.has_videos || ""}
          onChange={(v) => update("has_videos", v)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FileUpload
          label="Upload work photos (up to 5)"
          files={data.work_photo_uploads || []}
          onChange={(f) => update("work_photo_uploads", f)}
          uploadUrl={`/api/intake/${slug}/upload`}
          max={5}
          accept="image/*"
        />

        <TextArea
          label="Anything else — testimonials, certifications, awards?"
          value={data.other_content || ""}
          onChange={(v) => update("other_content", v)}
          placeholder="Licensed & insured, BBB accredited, 5-star reviews..."
          name="other_content"
          minRows={3}
        />
      </div>
    </SectionWrapper>
  );
}
