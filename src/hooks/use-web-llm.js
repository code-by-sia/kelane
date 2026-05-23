/**
 * useWebLLM — lazy-initialised WebLLM engine hook.
 *
 * Manages the MLCEngine lifecycle: model download, caching (OPFS),
 * and text completion. Exposes a stable `extract(text)` function plus
 * status / progress for UI feedback.
 *
 * Status lifecycle:
 *   "idle" → "loading" (model download/cache) → "ready" → "extracting"
 *   Any error sets status to "error" and populates errorMessage.
 *
 * WebGPU is required (Chrome 113+, Edge 113+). If navigator.gpu is
 * absent this hook immediately sets status="unsupported".
 */

import { useState, useRef, useCallback } from "react";
import { CreateMLCEngine } from "@mlc-ai/web-llm";

// Small instruction-tuned model — <2 GB VRAM, good JSON extraction quality.
const MODEL_ID = "Llama-3.2-1B-Instruct-q4f16_1-MLC";

// System prompt that instructs the model to output ONLY a JSON recipe.
const SYSTEM_PROMPT = `You are a recipe extraction assistant. Extract recipe information from the provided text and return ONLY a valid JSON object — no markdown, no explanation, no extra text.

The JSON must match this exact schema:
{
  "name": "Recipe Name",
  "summary": "Brief description",
  "calories": 450,
  "guests": 4,
  "preperationTime": 30,
  "image": "",
  "categories": [],
  "ingredients": ["200g flour", "2 eggs", "1 tsp salt"],
  "steps": [
    { "id": "1", "action": "Mix flour and eggs", "duration": 5, "dependsOn": [] }
  ],
  "tools": ["mixing bowl", "whisk"]
}

Rules:
- calories and guests must be numbers (integers). Use null if unknown.
- preperationTime is total cook+prep time in minutes (integer). Use null if unknown.
- ingredients is an array of strings, each with quantity + unit + name.
- steps is an array with sequential id strings starting at "1".
- dependsOn in each step is an array of step id strings that must complete first.
- Return ONLY the JSON object, nothing else.`;

export function useWebLLM() {
  const [status, setStatus] = useState(() =>
    typeof navigator !== "undefined" && !navigator.gpu
      ? "unsupported"
      : "idle",
  );
  const [progress, setProgress] = useState(0); // 0-100
  const [errorMessage, setErrorMessage] = useState(null);
  const engineRef = useRef(null);
  const initPromiseRef = useRef(null);

  /** Ensure the engine is initialised (downloads & caches model on first call) */
  const ensureEngine = useCallback(async () => {
    if (engineRef.current) return engineRef.current;

    // If already initialising, wait on the same promise
    if (initPromiseRef.current) return initPromiseRef.current;

    initPromiseRef.current = (async () => {
      setStatus("loading");
      setProgress(0);
      setErrorMessage(null);

      const engine = await CreateMLCEngine(MODEL_ID, {
        initProgressCallback: (info) => {
          // info.progress is 0-1
          setProgress(Math.round((info.progress ?? 0) * 100));
        },
      });

      engineRef.current = engine;
      initPromiseRef.current = null;
      setStatus("ready");
      setProgress(100);
      return engine;
    })();

    try {
      return await initPromiseRef.current;
    } catch (err) {
      initPromiseRef.current = null;
      setStatus("error");
      setErrorMessage(err?.message ?? "Model failed to load");
      throw err;
    }
  }, []);

  /**
   * Extract a structured recipe from raw text.
   * Returns a parsed recipe object or throws on failure.
   */
  const extract = useCallback(
    async (rawText) => {
      const engine = await ensureEngine();
      setStatus("extracting");

      try {
        // Trim to ~8000 chars to stay within context window
        const trimmed = rawText.slice(0, 8000);

        const chunks = [];
        const stream = await engine.chat.completions.create({
          stream: true,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: `Extract the recipe from this text:\n\n${trimmed}`,
            },
          ],
          temperature: 0.1, // Low temperature for deterministic JSON output
          max_tokens: 2048,
        });

        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content ?? "";
          chunks.push(delta);
        }

        const raw = chunks.join("").trim();

        // Strip any accidental markdown code fences
        const jsonText = raw
          .replace(/^```(?:json)?\s*/i, "")
          .replace(/\s*```$/, "")
          .trim();

        const parsed = JSON.parse(jsonText);
        setStatus("ready");
        return parsed;
      } catch (err) {
        setStatus("ready");
        throw err;
      }
    },
    [ensureEngine],
  );

  return { extract, status, progress, errorMessage };
}
