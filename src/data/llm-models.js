/**
 * LLM model options available via WebLLM (on-device, WebGPU).
 * All models run locally — no data leaves the browser.
 */
export const LLM_MODELS = [
  {
    id: "Llama-3.2-1B-Instruct-q4f16_1-MLC",
    name: "Llama 3.2 · 1B",
    description: "Fastest. Great for quick recipe scans.",
    size: "~0.9 GB",
    speed: "fast",
  },
  {
    id: "Llama-3.2-3B-Instruct-q4f16_1-MLC",
    name: "Llama 3.2 · 3B",
    description: "Better extraction accuracy, moderate speed.",
    size: "~1.9 GB",
    speed: "medium",
  },
  {
    id: "Phi-3.5-mini-instruct-q4f16_1-MLC",
    name: "Phi 3.5 Mini · 3.8B",
    description: "Best quality. Needs ~2 GB VRAM.",
    size: "~2.2 GB",
    speed: "slow",
  },
  {
    id: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
    name: "Qwen 2.5 · 1.5B",
    description: "Efficient multilingual model.",
    size: "~1.1 GB",
    speed: "fast",
  },
];

export const DEFAULT_MODEL_ID = LLM_MODELS[0].id;
