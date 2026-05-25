import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_MODEL_ID } from "@/data/llm-models";
import { idbStorage } from "@/lib/idb-storage";

export const PROXY_PRESETS = [
  {
    label: "Local proxy (recommended)",
    id: "local",
    prefix: "http://localhost:3001/?url=",
    hint: "Run: npm run proxy",
  },
  {
    label: "corsproxy.io",
    id: "corsproxy",
    prefix: "https://corsproxy.io/?",
    hint: "Public — may be rate-limited",
  },
  {
    label: "allorigins.win",
    id: "allorigins",
    prefix: "https://api.allorigins.win/raw?url=",
    hint: "Public — may be slow",
  },
  {
    label: "Custom…",
    id: "custom",
    prefix: null, // user supplies full prefix
    hint: "Paste your proxy prefix (e.g. https://my-proxy.com/?url=)",
  },
];

const useSettingsStore = create(
  persist(
    (set) => ({
      // "local" | "corsproxy" | "allorigins" | "custom"
      proxyPresetId: "allorigins",
      // When proxyPresetId === "custom", this is the full prefix to prepend
      customProxyPrefix: "",

      // "tomato" | "warm-kitchen" | "sage" | "ocean" | "aubergine"
      themeId: "tomato",

      // LLM model used by the recipe scanner and Hejar assistant (on-device WebLLM)
      modelId: DEFAULT_MODEL_ID,

      // Hejar assistant settings
      chefTemperature: 0.72,   // 0.4 = precise · 0.72 = balanced · 1.1 = creative

      setProxyPreset: (id) => set({ proxyPresetId: id }),
      setCustomProxyPrefix: (prefix) => set({ customProxyPrefix: prefix }),
      setTheme: (id) => set({ themeId: id }),
      setModel: (id) => set({ modelId: id }),
      setChefTemperature: (t) => set({ chefTemperature: t }),
    }),
    { name: "kelane-settings", storage: idbStorage },
  ),
);

/** Returns the active proxy prefix string (e.g. "http://localhost:3001/?url=") */
export function getProxyPrefix(state) {
  const preset = PROXY_PRESETS.find((p) => p.id === state.proxyPresetId);
  if (!preset) return PROXY_PRESETS[0].prefix;
  if (preset.id === "custom") return state.customProxyPrefix;
  return preset.prefix;
}

export default useSettingsStore;
