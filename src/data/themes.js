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
    swatchBg:      "oklch(0.974 0.022 17)",
  },
  {
    id: "warm-kitchen",
    name: "Warm Kitchen",
    description: "Amber & espresso",
    swatchPrimary: "oklch(0.769 0.188 70.08)",
    swatchSidebar: "oklch(0.155 0.040 25)",
    swatchBg:      "oklch(0.975 0.022 80)",
  },
  {
    id: "sage",
    name: "Sage",
    description: "Herb green & forest",
    swatchPrimary: "oklch(0.546 0.122 149)",
    swatchSidebar: "oklch(0.118 0.038 149)",
    swatchBg:      "oklch(0.974 0.018 149)",
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Azure & deep navy",
    swatchPrimary: "oklch(0.558 0.190 232)",
    swatchSidebar: "oklch(0.112 0.040 240)",
    swatchBg:      "oklch(0.974 0.016 232)",
  },
  {
    id: "aubergine",
    name: "Aubergine",
    description: "Eggplant & plum",
    swatchPrimary: "oklch(0.562 0.200 298)",
    swatchSidebar: "oklch(0.108 0.038 300)",
    swatchBg:      "oklch(0.974 0.018 298)",
  },
];
