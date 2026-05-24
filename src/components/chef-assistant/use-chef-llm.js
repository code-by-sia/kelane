/**
 * useChefLLM — conversational chef assistant powered by WebLLM.
 *
 * Uses a module-level engine singleton so the model is never loaded twice
 * (shared with the recipe scanner if both are active).
 *
 * Status lifecycle:
 *   "idle" → "loading" → "thinking" → "ready"
 *   "unsupported" when WebGPU is absent.
 *
 * Action tags the LLM can embed in its responses:
 *   [NAV:/path]       — navigate to an app route
 *   [LIKE:recipe name] — toggle the recipe's liked/favourite flag
 *   [FLAG:recipe name] — toggle the recipe's want-to-cook flag
 * Tags are stripped from displayed text and returned as pendingActions[].
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

// ── Tag parsers ────────────────────────────────────────────────────────────────
// CHOICE tags are kept in the stored message (parsed by the UI for buttons).
// NAV / LIKE / FLAG tags are stripped and executed as side-effects.
// All tags are stripped from the live streaming display.

function stripStreamingTags(text) {
  // Remove complete tags; also strip an incomplete tag at the end of the buffer
  // (e.g. "[CHOICE: Tell me" still streaming in).
  return text
    .replace(/\[(NAV|LIKE|FLAG|CHOICE):[^\]]+\]/g, "")
    .replace(/\[(NAV|LIKE|FLAG|CHOICE):[^\]]*$/, "")
    .trim();
}

function parseActions(text) {
  const actions = [];
  const cleaned = text
    .replace(/\[NAV:([^\]]+)\]/g, (_, path) => {
      actions.push({ type: "navigate", payload: path.trim() });
      return "";
    })
    .replace(/\[LIKE:([^\]]+)\]/g, (_, name) => {
      actions.push({ type: "like", payload: name.trim() });
      return "";
    })
    .replace(/\[FLAG:([^\]]+)\]/g, (_, name) => {
      actions.push({ type: "flag", payload: name.trim() });
      return "";
    })
    .trim();
  return { cleaned, actions };
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useChefLLM() {
  const modelId     = useSettingsStore((s) => s.modelId)          || DEFAULT_MODEL_ID;
  const temperature = useSettingsStore((s) => s.chefTemperature)  ?? 0.72;

  const [status, setStatus] = useState(() =>
    typeof navigator !== "undefined" && !navigator.gpu ? "unsupported" : "idle",
  );
  const [progress, setProgress]           = useState(0);
  const [messages, setMessages]           = useState([]); // {role, content} displayed
  const [streaming, setStreaming]         = useState(""); // in-flight assistant text (tags stripped)
  const [pendingActions, setPendingActions] = useState([]);
  const historyRef = useRef([]); // full conversation sent to the LLM

  const send = useCallback(
    async (userText, systemPrompt) => {
      if (status === "unsupported") return;

      const userMsg = { role: "user", content: userText };
      historyRef.current = [...historyRef.current, userMsg];
      setMessages((m) => [...m, userMsg]);
      setStreaming("");

      try {
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
          temperature,
          max_tokens: 512,
        });

        let full = "";
        for await (const chunk of stream) {
          full += chunk.choices[0]?.delta?.content ?? "";
          // Strip action tags from the live display so the user never sees them
          setStreaming(stripStreamingTags(full));
        }

        // Final parse: separate clean text from action instructions
        const { cleaned, actions: parsedActions } = parseActions(full);

        const assistantMsg = { role: "assistant", content: cleaned };
        historyRef.current = [...historyRef.current, assistantMsg];
        setMessages((m) => [...m, assistantMsg]);
        setStreaming("");
        setStatus("ready");

        if (parsedActions.length) setPendingActions(parsedActions);
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
    setPendingActions([]);
    setStatus((s) => (s === "unsupported" ? s : "idle"));
  }, []);

  const clearActions = useCallback(() => setPendingActions([]), []);

  return { messages, streaming, send, status, progress, clear, pendingActions, clearActions };
}
