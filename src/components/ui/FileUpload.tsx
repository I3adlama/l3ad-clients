"use client";

import { useRef, useState } from "react";
import type { UploadedFile } from "@/lib/types";

interface FileUploadProps {
  label: string;
  files: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  uploadUrl: string;
  max?: number;
  accept?: string;
}

export default function FileUpload({
  label,
  files,
  onChange,
  uploadUrl,
  max = 3,
  accept = "image/*,.pdf",
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFiles(fileList: FileList) {
    setError("");
    const remaining = max - files.length;
    const toUpload = Array.from(fileList).slice(0, remaining);

    if (toUpload.length === 0) return;

    setUploading(true);
    const uploaded: UploadedFile[] = [];

    for (const file of toUpload) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(uploadUrl, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Upload failed");
          break;
        }

        const result: UploadedFile = await res.json();
        uploaded.push(result);
      } catch {
        setError("Upload failed. Please try again.");
        break;
      }
    }

    if (uploaded.length > 0) {
      onChange([...files, ...uploaded]);
    }
    setUploading(false);
  }

  function removeFile(index: number) {
    onChange(files.filter((_, i) => i !== index));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
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
            <div key={i} className="relative group">
              {file.content_type.startsWith("image/") ? (
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
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                x
              </button>
              <p className="text-[9px] text-[var(--text-soft)] mt-0.5 truncate w-20">
                {file.filename}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {files.length < max && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-[var(--border)] rounded-lg p-6 text-center cursor-pointer hover:border-accent transition-colors"
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
              <span className="text-sm text-[var(--text-muted)]">Uploading...</span>
            </div>
          ) : (
            <>
              <p className="text-sm text-[var(--text-muted)]">
                Drop files here or click to browse
              </p>
              <p className="text-xs text-[var(--text-soft)] mt-1">
                {files.length}/{max} files &middot; JPEG, PNG, WebP, GIF, or PDF &middot; Max 10MB
              </p>
            </>
          )}
        </div>
      )}

      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
    </div>
  );
}
