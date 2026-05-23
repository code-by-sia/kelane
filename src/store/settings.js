import { create } from "zustand";
import { persist } from "zustand/middleware";

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
      proxyPresetId: "local",
      // When proxyPresetId === "custom", this is the full prefix to prepend
      customProxyPrefix: "",

      // "tomato" | "warm-kitchen" | "sage" | "ocean" | "aubergine"
      themeId: "tomato",

      setProxyPreset: (id) => set({ proxyPresetId: id }),
      setCustomProxyPrefix: (prefix) => set({ customProxyPrefix: prefix }),
      setTheme: (id) => set({ themeId: id }),
    }),
    { name: "kelane-settings" },
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
