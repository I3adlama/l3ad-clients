/**
 * Text utilities shared by the AI pipelines.
 * Pure functions, safe to import anywhere.
 */

/** Long-form date line injected into every prompt so the model knows "now". */
export function todayLine(): string {
  const now = new Date();
  const long = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return `Today's date is ${long}. Anything dated ${now.getFullYear()} or ${now.getFullYear() - 1} is recent, not an error.`;
}

/**
 * Brand rule: no em or en dashes anywhere in generated copy.
 * Between digits a dash becomes a hyphen ("2004-2026"); elsewhere it becomes a comma pause.
 */
export function scrubDashes(text: string): string {
  return text
    .replace(/(\d)\s*[—–]\s*(\d)/g, "$1-$2")
    .replace(/\s*[—–]\s*/g, ", ")
    .replace(/,\s*,/g, ",")
    .replace(/\(\s*,\s*/g, "(")
    .replace(/\s*,\s*\)/g, ")")
    .replace(/:\s*,\s*/g, ": ")
    .replace(/\s*,\s*([.!?])/g, "$1");
}

/** Recursively apply scrubDashes to every string in a JSON-like value. */
export function deepScrub<T>(value: T): T {
  if (typeof value === "string") return scrubDashes(value) as T;
  if (Array.isArray(value)) return value.map((v) => deepScrub(v)) as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = deepScrub(v);
    }
    return out as T;
  }
  return value;
}

/** Recursively drop null values, empty strings and empty arrays/objects. */
export function pruneEmpty<T>(value: T): T {
  if (Array.isArray(value)) {
    const arr = value
      .map((v) => pruneEmpty(v))
      .filter((v) => !isEmpty(v));
    return arr as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const pruned = pruneEmpty(v);
      if (!isEmpty(pruned)) out[k] = pruned;
    }
    return out as T;
  }
  return value;
}

function isEmpty(v: unknown): boolean {
  if (v === null || v === undefined) return true;
  if (typeof v === "string") return v.trim() === "";
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === "object") return Object.keys(v as object).length === 0;
  return false;
}

/** Structural equality for plain JSON values (key order independent). */
export function jsonEqual(a: unknown, b: unknown): boolean {
  return stableStringify(a) === stableStringify(b);
}

function stableStringify(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(stableStringify).join(",")}]`;
  if (v && typeof v === "object") {
    const keys = Object.keys(v as object).sort();
    return `{${keys
      .map((k) => `${JSON.stringify(k)}:${stableStringify((v as Record<string, unknown>)[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(v) ?? "null";
}

/** Case/whitespace-insensitive string match used when removing list items. */
export function sameText(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}
