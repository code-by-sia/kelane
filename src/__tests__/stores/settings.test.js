/**
 * Tests for src/store/settings.js
 */



let useSettingsStore, getProxyPrefix, PROXY_PRESETS;

beforeAll(() => {
  ({ default: useSettingsStore, getProxyPrefix, PROXY_PRESETS } = require("@/store/settings"));
});

beforeEach(() => {
  localStorage.clear();
  useSettingsStore.setState({
    proxyPresetId: "allorigins",
    customProxyPrefix: "",
    themeId: "tomato",
    modelId: "Llama-3.2-1B-Instruct-q4f16_1-MLC",
    chefTemperature: 0.72,
  });
});

describe("setProxyPreset", () => {
  test("updates proxyPresetId", () => {
    useSettingsStore.getState().setProxyPreset("local");
    expect(useSettingsStore.getState().proxyPresetId).toBe("local");
  });
});

describe("setCustomProxyPrefix", () => {
  test("updates customProxyPrefix", () => {
    useSettingsStore.getState().setCustomProxyPrefix("https://myproxy.com/?url=");
    expect(useSettingsStore.getState().customProxyPrefix).toBe("https://myproxy.com/?url=");
  });
});

describe("setTheme", () => {
  test("updates themeId", () => {
    useSettingsStore.getState().setTheme("sage");
    expect(useSettingsStore.getState().themeId).toBe("sage");
  });
});

describe("setModel", () => {
  test("updates modelId", () => {
    useSettingsStore.getState().setModel("Phi-3.5-mini-instruct-q4f16_1-MLC");
    expect(useSettingsStore.getState().modelId).toBe("Phi-3.5-mini-instruct-q4f16_1-MLC");
  });
});

describe("setChefTemperature", () => {
  test("updates chefTemperature", () => {
    useSettingsStore.getState().setChefTemperature(1.1);
    expect(useSettingsStore.getState().chefTemperature).toBe(1.1);
  });
});

describe("getProxyPrefix", () => {
  test("returns the prefix for the active preset", () => {
    const state = { proxyPresetId: "corsproxy", customProxyPrefix: "" };
    const prefix = getProxyPrefix(state);
    const expected = PROXY_PRESETS.find((p) => p.id === "corsproxy").prefix;
    expect(prefix).toBe(expected);
  });

  test("returns customProxyPrefix when preset is 'custom'", () => {
    const state = { proxyPresetId: "custom", customProxyPrefix: "https://my.proxy/?url=" };
    expect(getProxyPrefix(state)).toBe("https://my.proxy/?url=");
  });

  test("falls back to first preset for unknown presetId", () => {
    const state = { proxyPresetId: "unknown", customProxyPrefix: "" };
    expect(getProxyPrefix(state)).toBe(PROXY_PRESETS[0].prefix);
  });

  test("returns local proxy prefix for 'local' preset", () => {
    const state = { proxyPresetId: "local", customProxyPrefix: "" };
    expect(getProxyPrefix(state)).toBe("http://localhost:3001/?url=");
  });
});
