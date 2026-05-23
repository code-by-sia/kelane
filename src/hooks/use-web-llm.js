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
import useSettingsStore from "@/store/settings";
import { DEFAULT_MODEL_ID } from "@/data/llm-models";

// System prompt — instructs the model to output ONLY a valid JSON recipe.
const SYSTEM_PROMPT = `You are a structured recipe extraction assistant. Parse the provided text and return ONLY a valid JSON object — no markdown, no code fences, no explanation.

Use exactly this schema:
{
  "name": "string — exact recipe title",
  "summary": "string — 1-2 sentence description of the dish and its key flavour profile",
  "calories": number|null,
  "guests": number|null,
  "preperationTime": number|null,
  "image": "",
  "categories": ["string"],
  "ingredients": ["string"],
  "steps": [{ "id": "string", "action": "string", "duration": number|null, "dependsOn": ["string"] }],
  "tools": ["string"]
}

Field rules:
• calories — total kcal per serving; integer or null
• guests — number of servings; integer or null
• preperationTime — total prep + cook time in minutes; integer or null
• categories — cuisine or dish-type tags, e.g. ["Italian", "Pasta", "Vegetarian"]
• ingredients — one string per ingredient; always include quantity + unit when given, e.g. "250 g flour", "2 large eggs", "1 tsp salt". Keep the original wording where possible.
• steps — 6–15 steps for a typical recipe; each step must:
    - cover exactly ONE distinct task (chop, mix, bake — not a paragraph)
    - start with an imperative verb (Mix, Bake, Simmer, Chop …)
    - be a complete instruction in 1–3 sentences
    - have a realistic duration in minutes (e.g. "Boil water" ≈ 5, "Simmer sauce" ≈ 20, "Rest dough" ≈ 60)
    - list dependsOn IDs for all prerequisite steps (sequential steps depend on the previous one; independent prep steps may have an empty dependsOn or share a common prerequisite)
• tools — equipment list, e.g. ["large pot", "whisk", "oven"]
• Return ONLY the JSON. If a value cannot be found in the text, use null or [].`;

export function useWebLLM() {
  // Read model from settings; fall back to default if not set.
  const modelId = useSettingsStore((s) => s.modelId) || DEFAULT_MODEL_ID;

  const [status, setStatus] = useState(() =>
    typeof navigator !== "undefined" && !navigator.gpu
      ? "unsupported"
      : "idle",
  );
  const [progress, setProgress] = useState(0); // 0-100
  const [errorMessage, setErrorMessage] = useState(null);
  const engineRef = useRef(null);
  const initPromiseRef = useRef(null);
  // Track which model the current engine was built with; re-init if changed.
  const loadedModelRef = useRef(null);

  /** Ensure the engine is initialised (downloads & caches model on first call) */
  const ensureEngine = useCallback(async () => {
    // Re-initialise if the selected model has changed since last load.
    if (engineRef.current && loadedModelRef.current !== modelId) {
      engineRef.current = null;
      initPromiseRef.current = null;
      loadedModelRef.current = null;
    }

    if (engineRef.current) return engineRef.current;

    // If already initialising, wait on the same promise
    if (initPromiseRef.current) return initPromiseRef.current;

    initPromiseRef.current = (async () => {
      setStatus("loading");
      setProgress(0);
      setErrorMessage(null);

      const engine = await CreateMLCEngine(modelId, {
        initProgressCallback: (info) => {
          // info.progress is 0-1
          setProgress(Math.round((info.progress ?? 0) * 100));
        },
      });

      engineRef.current = engine;
      loadedModelRef.current = modelId;
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
  }, [modelId]);

  /**
   * Extract a structured recipe from raw text.
   * Returns a parsed recipe object or throws on failure.
   */
  const extract = useCallback(
    async (rawText) => {
      const engine = await ensureEngine();
      setStatus("extracting");

      try {
        // Trim to ~12 000 chars — enough for most recipe pages while staying
        // safely within the 1B/3B models' usable context window.
        const trimmed = rawText.slice(0, 12000);

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
