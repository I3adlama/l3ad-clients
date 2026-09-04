import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { z } from "zod";

export const client = new Anthropic({ apiKey: process.env.AGENT_1 });

/**
 * Current model lineup.
 *  fast      Haiku 4.5   $1/$5    extraction grunt work, no thinking
 *  balanced  Sonnet 5    $2/$10   creative generation, adaptive thinking
 *  quality   Opus 5      $5/$25   strategy, research, final review, adaptive thinking
 */
export const MODELS = {
  fast: "claude-haiku-4-5",
  balanced: "claude-sonnet-5",
  quality: "claude-opus-5",
} as const;

export type ModelId = (typeof MODELS)[keyof typeof MODELS];
export type Effort = "low" | "medium" | "high" | "xhigh" | "max";

/** Opus 5 safety classifiers can decline a request; fallbacks re-run it server-side. */
const OPUS_FALLBACK = {
  betas: ["server-side-fallback-2026-07-01"] as const,
  fallbacks: "default" as const,
};

export class ModelRefusalError extends Error {
  constructor(model: string, category: string | null | undefined) {
    super(`${model} declined the request${category ? ` (${category})` : ""}`);
    this.name = "ModelRefusalError";
  }
}

interface BaseCall {
  model: ModelId;
  maxTokens: number;
  /** Ignored on Haiku 4.5 (the API rejects effort there). */
  effort?: Effort;
  system?: string;
  prompt: string;
  /** Short name used in logs. */
  label: string;
  /** Per-request timeout in ms. */
  timeoutMs?: number;
}

function outputConfig(model: ModelId, effort: Effort | undefined) {
  return model === MODELS.fast || !effort ? {} : { effort };
}

function fallbackParams(model: ModelId) {
  return model === MODELS.quality ? OPUS_FALLBACK : {};
}

/**
 * One structured call: the model must answer with JSON matching `schema`.
 * Uses the API's constrained output so the shape is guaranteed; no regex parsing.
 */
export async function callStructured<S extends z.ZodType>(
  opts: BaseCall & { schema: S }
): Promise<z.infer<S>> {
  const started = Date.now();
  const format = betaZodOutputFormat(opts.schema);

  const request = () =>
    client.beta.messages.parse(
      {
        model: opts.model,
        max_tokens: opts.maxTokens,
        ...(opts.system ? { system: opts.system } : {}),
        messages: [{ role: "user", content: opts.prompt }],
        output_config: {
          format,
          ...outputConfig(opts.model, opts.effort),
        },
        ...fallbackParams(opts.model),
      },
      { timeout: opts.timeoutMs ?? 180_000 }
    );

  let response: Awaited<ReturnType<typeof request>>;
  try {
    response = await request();
  } catch (err) {
    const status = (err as { status?: number } | null)?.status;
    const message = err instanceof Error ? err.message : String(err);
    if (status === 400 && /grammar/i.test(message)) {
      const schemaJson = JSON.stringify(format.schema);
      console.warn(
        `[ai] ${opts.label}: constrained output rejected (${schemaJson.length} chars of schema); falling back to prompted JSON. Schema: ${schemaJson.slice(0, 1500)}`
      );
      return callPromptedJson(opts, schemaJson, started);
    }
    throw new Error(`${opts.label} (${opts.model}): ${describeError(err)}`);
  }

  logUsage(opts.label, opts.model, started, response.usage, response.stop_reason);

  if (response.stop_reason === "refusal") {
    throw new ModelRefusalError(response.model, response.stop_details?.category);
  }
  if (response.stop_reason === "max_tokens") {
    throw new Error(`${opts.label}: ${opts.model} hit max_tokens (${opts.maxTokens}); output truncated`);
  }
  if (!response.parsed_output) {
    throw new Error(`${opts.label}: ${opts.model} returned no parseable JSON`);
  }
  return response.parsed_output;
}

/**
 * Fallback when the API cannot compile a grammar for the schema: ask for JSON in the prompt
 * and validate it with the same Zod schema. Retries once on a validation failure.
 */
async function callPromptedJson<S extends z.ZodType>(
  opts: BaseCall & { schema: S },
  schemaJson: string,
  started: number
): Promise<z.infer<S>> {
  const system = [
    opts.system || "",
    `Respond with a single JSON object and nothing else: no markdown fences, no commentary. It must validate against this JSON Schema:\n${schemaJson}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  let lastError = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await client.beta.messages.create(
      {
        model: opts.model,
        max_tokens: opts.maxTokens,
        system,
        messages: [
          { role: "user", content: attempt === 0 ? opts.prompt : `${opts.prompt}\n\nYour previous JSON failed validation: ${lastError}. Return corrected JSON only.` },
        ],
        output_config: { ...outputConfig(opts.model, opts.effort) },
        ...fallbackParams(opts.model),
      },
      { timeout: opts.timeoutMs ?? 180_000 }
    );

    logUsage(`${opts.label} (prompted json${attempt ? ", retry" : ""})`, opts.model, started, response.usage, response.stop_reason);

    if (response.stop_reason === "refusal") {
      throw new ModelRefusalError(response.model, response.stop_details?.category);
    }

    const text = response.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");
    const first = text.indexOf("{");
    const last = text.lastIndexOf("}");
    if (first === -1 || last === -1) {
      lastError = "no JSON object found";
      continue;
    }

    try {
      const parsed = opts.schema.safeParse(JSON.parse(text.slice(first, last + 1)));
      if (parsed.success) return parsed.data;
      lastError = parsed.error.issues
        .slice(0, 5)
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ");
    } catch (e) {
      lastError = e instanceof Error ? e.message : "invalid JSON";
    }
  }
  throw new Error(`${opts.label}: ${opts.model} could not produce valid JSON (${lastError})`);
}

/**
 * Free-text call with the server-side web search tool.
 * Handles `pause_turn` continuations and returns the joined text plus how many searches ran.
 */
export async function callWithWebSearch(
  opts: BaseCall & { maxSearches: number }
): Promise<{ text: string; searches: number }> {
  const started = Date.now();
  const messages: Anthropic.Beta.BetaMessageParam[] = [
    { role: "user", content: opts.prompt },
  ];
  let text = "";
  let searches = 0;
  // One deadline for the whole search loop, not per continuation turn
  const signal = AbortSignal.timeout(opts.timeoutMs ?? 180_000);

  for (let turn = 0; turn < 4; turn++) {
    const response = await client.beta.messages.create(
      {
        model: opts.model,
        max_tokens: opts.maxTokens,
        ...(opts.system ? { system: opts.system } : {}),
        messages,
        // The basic variant calls search directly. The newer "dynamic filtering" variant runs
        // searches from a code sandbox, where low-effort runs duplicated queries and burned the cap.
        tools: [
          { type: "web_search_20250305", name: "web_search", max_uses: opts.maxSearches },
        ],
        output_config: { ...outputConfig(opts.model, opts.effort) },
        ...fallbackParams(opts.model),
      },
      { timeout: opts.timeoutMs ?? 180_000, signal }
    );

    logUsage(`${opts.label} turn ${turn + 1}`, opts.model, started, response.usage, response.stop_reason);

    // Cited answers arrive as many short text blocks split mid-sentence; join them as-is.
    for (const block of response.content) {
      if (block.type === "text") text += block.text;
      if (block.type === "server_tool_use") searches++;
    }
    text += "\n";

    if (response.stop_reason === "refusal") {
      throw new ModelRefusalError(response.model, response.stop_details?.category);
    }
    if (response.stop_reason === "pause_turn") {
      messages.push({ role: "assistant", content: response.content });
      continue;
    }
    break;
  }

  return { text: text.trim(), searches };
}

/**
 * Run a manager-tier step on Opus 5; if it fails for any reason, retry once on Sonnet 5.
 * Returns which model produced the result so the pipeline can record it.
 */
export async function withManagerFallback<T>(
  label: string,
  run: (model: ModelId) => Promise<T>
): Promise<{ result: T; model: ModelId }> {
  try {
    return { result: await run(MODELS.quality), model: MODELS.quality };
  } catch (err) {
    console.warn(`[ai] ${label} failed on ${MODELS.quality}, retrying on ${MODELS.balanced}: ${describeError(err)}`);
    return { result: await run(MODELS.balanced), model: MODELS.balanced };
  }
}

export function describeError(err: unknown): string {
  if (err instanceof Anthropic.APIError) return `API ${err.status}: ${err.message}`;
  if (err instanceof Error) return err.message;
  return String(err);
}

function logUsage(
  label: string,
  model: string,
  started: number,
  usage: { input_tokens: number; output_tokens: number } | undefined,
  stop: string | null | undefined
) {
  const secs = ((Date.now() - started) / 1000).toFixed(1);
  console.log(
    `[ai] ${label} | ${model} | ${secs}s | in=${usage?.input_tokens ?? "?"} out=${usage?.output_tokens ?? "?"} | stop=${stop ?? "?"}`
  );
}
