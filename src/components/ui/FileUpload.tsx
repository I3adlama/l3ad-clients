"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import type { UploadedFile } from "@/lib/types";
import {
  ALLOWED_UPLOAD_TYPES,
  MAX_UPLOAD_BYTES,
  UPLOAD_HINT,
  detectUploadType,
  safeFileName,
} from "@/lib/uploads";

interface FileUploadProps {
  label: string;
  files: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  /** Project slug; files land under intake/<slug>/ in Blob storage. */
  slug: string;
  max?: number;
  accept?: string;
}

export default function FileUpload({
  label,
  files,
  onChange,
  slug,
  max = 3,
  accept = "image/*,.heic,.heif,.pdf",
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  async function handleFiles(fileList: FileList) {
    setError("");
    const remaining = max - files.length;
    const toUpload = Array.from(fileList).slice(0, remaining);
    if (toUpload.length === 0) return;
    if (fileList.length > remaining) {
      setError(`Only ${remaining} more file${remaining === 1 ? "" : "s"} can be added.`);
    }

    let current = files;
    for (const file of toUpload) {
      const type = detectUploadType(file);
      if (!ALLOWED_UPLOAD_TYPES.includes(type)) {
        setError(`${file.name}: file type not supported. ${UPLOAD_HINT}`);
        break;
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        setError(`${file.name} is too large. Max 25MB per file.`);
        break;
      }

      setUploading(file.name);
      try {
        const blob = await upload(`intake/${slug}/${safeFileName(file.name)}`, file, {
          access: "public",
          handleUploadUrl: `/api/intake/${slug}/upload`,
          contentType: type,
        });
        const record: UploadedFile = {
          url: blob.url,
          filename: file.name,
          size: file.size,
          content_type: type,
          uploaded_at: new Date().toISOString(),
        };
        current = [...current, record];
        onChange(current);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        setError(
          /storage is unavailable/i.test(msg)
            ? "File storage is unavailable right now. Please try again in a minute."
            : `Upload failed for ${file.name}. ${msg ? msg.replace(/^Vercel Blob:\s*/i, "") : "Please try again."}`
        );
        break;
      } finally {
        setUploading(null);
      }
    }
  }

  function removeFile(index: number) {
    onChange(files.filter((_, i) => i !== index));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }

  return (
    <div>
      <span className="input-label">{label}</span>

      {/* Thumbnails */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-3">
          {files.map((file, i) => (
            <div key={`${file.url}-${i}`} className="relative group">
              {file.content_type.startsWith("image/") && !/heic|heif/.test(file.content_type) ? (
                <img
                  src={file.url}
                  alt={file.filename}
                  className="w-20 h-20 object-cover rounded-md border border-[var(--border)]"
                />
              ) : (
                <div className="w-20 h-20 rounded-md border border-[var(--border)] bg-noir-700 flex items-center justify-center">
                  <span className="text-[var(--text-soft)] text-xs text-center px-1">
                    {file.filename.split(".").pop()?.toUpperCase()}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeFile(i)}
                aria-label={`Remove ${file.filename}`}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
              >
                x
              </button>
              <p className="text-[9px] text-[var(--text-soft)] mt-0.5 truncate w-20" title={file.filename}>
                {file.filename}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {files.length < max && (
        <div
          role="button"
          tabIndex={0}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onClick={() => !uploading && inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragging ? "border-accent bg-accent/5" : "border-[var(--border)] hover:border-accent"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple
            className="sr-only"
            onChange={(e) => {
              if (e.target.files) handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
          {uploading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-[var(--text-muted)] truncate max-w-[220px]">Uploading {uploading}...</span>
            </div>
          ) : (
            <>
              <p className="text-sm text-[var(--text-muted)]">
                Drop files here or tap to choose
              </p>
              <p className="text-xs text-[var(--text-soft)] mt-1">
                {files.length}/{max} files &middot; {UPLOAD_HINT}
              </p>
            </>
          )}
        </div>
      )}

      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
    </div>
  );
}
