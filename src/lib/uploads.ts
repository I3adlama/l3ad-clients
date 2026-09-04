/** Upload limits shared by the intake form and the Blob token route. Client-safe. */

export const ALLOWED_UPLOAD_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
  "image/svg+xml",
  "application/pdf",
  "text/csv",
  "text/plain",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024; // 25MB

export const UPLOAD_HINT = "Images, PDF, CSV, or Excel. Max 25MB each.";

/** Some browsers report an empty type for HEIC and other camera formats; fall back to the extension. */
export function detectUploadType(file: { name: string; type: string }): string {
  if (file.type) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase();
  const byExt: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    heic: "image/heic",
    heif: "image/heif",
    svg: "image/svg+xml",
    pdf: "application/pdf",
    csv: "text/csv",
    txt: "text/plain",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
  return (ext && byExt[ext]) || "";
}

/** Keep blob paths predictable: ASCII, no separators, bounded length. */
export function safeFileName(name: string): string {
  const cleaned = name
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "");
  const trimmed = cleaned.slice(-80) || "file";
  return trimmed;
}
