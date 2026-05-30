/**
 * LLM model options available via WebLLM (on-device, WebGPU).
 * All models run locally — no data leaves the browser.
 *
 * VRAM figures are approximate and include KV-cache overhead.
 */
export const LLM_MODELS = [
  // ── Phi-3 / 4 family (Microsoft) ─────────────────────────────────────────
  {
    id: "Phi-3.5-mini-instruct-q4f16_1-MLC",
    name: "Phi 3.5 Mini",
    family: "Phi",
    description: "Best recipe extraction and chat quality. Recommended for most devices.",
    vram: "~3.7 GB",
    speed: "medium",
    badge: "Recommended",
  },
  {
    id: "Phi-4-mini-instruct-q4f16_1-MLC",
    name: "Phi 4 Mini",
    family: "Phi",
    description: "Newest Phi model. Slightly less VRAM than 3.5, similar quality.",
    vram: "~3.4 GB",
    speed: "medium",
  },
  {
    id: "Phi-3-mini-4k-instruct-q4f16_1-MLC",
    name: "Phi 3 Mini 4k",
    family: "Phi",
    description: "Phi-3 with a 4k context window.",
    vram: "~3.7 GB",
    speed: "medium",
  },
  // ── Llama 3.2 (Meta) ─────────────────────────────────────────────────────
  {
    id: "Llama-3.2-1B-Instruct-q4f16_1-MLC",
    name: "Llama 3.2 · 1B",
    family: "Llama",
    description: "Fastest and smallest download. Good for low-VRAM devices.",
    vram: "~0.9 GB",
    speed: "fast",
  },
  {
    id: "Llama-3.2-3B-Instruct-q4f16_1-MLC",
    name: "Llama 3.2 · 3B",
    family: "Llama",
    description: "Better accuracy than 1B, still relatively fast.",
    vram: "~2.3 GB",
    speed: "medium",
  },
  // ── Qwen 2.5 (Alibaba) ───────────────────────────────────────────────────
  {
    id: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
    name: "Qwen 2.5 · 1.5B",
    family: "Qwen",
    description: "Efficient multilingual model.",
    vram: "~1.6 GB",
    speed: "fast",
  },
];

/** Default model for the chef assistant chat */
export const DEFAULT_MODEL_ID = "Phi-3.5-mini-instruct-q4f16_1-MLC";

/** Default model for AI recipe scanning (can differ from chat model) */
export const DEFAULT_SCANNER_MODEL_ID = "Phi-3.5-mini-instruct-q4f16_1-MLC";

/** Speed → human label */
export const SPEED_LABEL = { fast: "Fast", medium: "Balanced", slow: "Slow" };

/** Speed → Tailwind color class */
export const SPEED_COLOR = {
  fast: "text-green-500",
  medium: "text-amber-500",
  slow: "text-red-400",
};
