/**
 * useChefLLM — conversational chef assistant powered by WebLLM.
 *
 * Uses a module-level engine singleton so the model is never loaded twice
 * (shared with the recipe scanner if both are active).
 *
 * Status lifecycle:
 *   "idle" → "loading" → "thinking" → "ready"
 *   "unsupported" when WebGPU is absent.
 */
import { useState, useCallback, useRef } from "react";
import { CreateMLCEngine } from "@mlc-ai/web-llm";
import useSettingsStore from "@/store/settings";
import { DEFAULT_MODEL_ID } from "@/data/llm-models";

// ── Module-level singleton ─────────────────────────────────────────────────────
let _engine = null;
let _engineModelId = null;
let _enginePromise = null;

async function getEngine(modelId, onProgress) {
  if (_engine && _engineModelId !== modelId) {
    // Model changed — discard the old engine
    _engine = null;
    _engineModelId = null;
    _enginePromise = null;
  }
  if (_engine) return _engine;
  if (!_enginePromise) {
    _enginePromise = CreateMLCEngine(modelId, {
      initProgressCallback: (info) =>
        onProgress?.(Math.round((info.progress ?? 0) * 100)),
    })
      .then((eng) => {
        _engine = eng;
        _engineModelId = modelId;
        _enginePromise = null;
        return eng;
      })
      .catch((err) => {
        _enginePromise = null;
        throw err;
      });
  }
  return _enginePromise;
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useChefLLM() {
  const modelId = useSettingsStore((s) => s.modelId) || DEFAULT_MODEL_ID;

  const [status, setStatus] = useState(() =>
    typeof navigator !== "undefined" && !navigator.gpu ? "unsupported" : "idle",
  );
  const [progress, setProgress] = useState(0);
  const [messages, setMessages] = useState([]); // {role, content} displayed
  const [streaming, setStreaming] = useState(""); // in-flight assistant text
  const historyRef = useRef([]); // full conversation sent to the LLM

  const send = useCallback(
    async (userText, systemPrompt) => {
      if (status === "unsupported") return;

      // Append user message immediately
      const userMsg = { role: "user", content: userText };
      historyRef.current = [...historyRef.current, userMsg];
      setMessages((m) => [...m, userMsg]);
      setStreaming("");

      try {
        // Only show loading bar if the engine isn't cached yet
        const needsLoad = !_engine || _engineModelId !== modelId;
        if (needsLoad) {
          setStatus("loading");
          setProgress(0);
        } else {
          setStatus("thinking");
        }
        const engine = await getEngine(modelId, (p) => needsLoad && setProgress(p));
        setStatus("thinking");

        const stream = await engine.chat.completions.create({
          stream: true,
          messages: [
            { role: "system", content: systemPrompt },
            ...historyRef.current,
          ],
          temperature: 0.72,
          max_tokens: 512,
        });

        let full = "";
        for await (const chunk of stream) {
          full += chunk.choices[0]?.delta?.content ?? "";
          setStreaming(full);
        }

        const assistantMsg = { role: "assistant", content: full };
        historyRef.current = [...historyRef.current, assistantMsg];
        setMessages((m) => [...m, assistantMsg]);
        setStreaming("");
        setStatus("ready");
      } catch (err) {
        console.error("[ChefLLM]", err);
        const errMsg = {
          role: "assistant",
          content: "Xeyro! Something went wrong — please try again. 🙏",
        };
        historyRef.current = [...historyRef.current, errMsg];
        setMessages((m) => [...m, errMsg]);
        setStreaming("");
        setStatus("ready");
      }
    },
    [modelId, status],
  );

  const clear = useCallback(() => {
    historyRef.current = [];
    setMessages([]);
    setStreaming("");
    setStatus((s) => (s === "unsupported" ? s : "idle"));
  }, []);

  return { messages, streaming, send, status, progress, clear };
}
