/**
 * Kelane theme definitions.
 * Each entry drives both the theme-picker UI swatch and the CSS data-theme selector.
 * swatchBg matches the --background for that theme (visible tint).
 */
export const THEMES = [
  {
    id: "tomato",
    name: "Tomato",
    description: "Crimson & burgundy",
    swatchPrimary: "oklch(0.586 0.253 17.585)",
    swatchSidebar: "oklch(0.122 0.043 17)",
    swatchBg:      "oklch(0.963 0.026 17)",
  },
  {
    id: "warm-kitchen",
    name: "Warm Kitchen",
    description: "Amber & espresso",
    swatchPrimary: "oklch(0.740 0.195 60)",
    swatchSidebar: "oklch(0.155 0.040 25)",
    swatchBg:      "oklch(0.964 0.028 80)",
  },
  {
    id: "sage",
    name: "Sage",
    description: "Herb green & forest",
    swatchPrimary: "oklch(0.520 0.135 149)",
    swatchSidebar: "oklch(0.118 0.038 149)",
    swatchBg:      "oklch(0.962 0.024 149)",
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Azure & deep navy",
    swatchPrimary: "oklch(0.540 0.210 232)",
    swatchSidebar: "oklch(0.112 0.040 240)",
    swatchBg:      "oklch(0.962 0.022 232)",
  },
  {
    id: "aubergine",
    name: "Aubergine",
    description: "Eggplant & plum",
    swatchPrimary: "oklch(0.540 0.220 298)",
    swatchSidebar: "oklch(0.108 0.038 300)",
    swatchBg:      "oklch(0.962 0.022 298)",
  },
];
