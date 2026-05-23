import { useEffect } from "react";
import useSettingsStore from "@/store/settings";

/**
 * ThemeProvider — syncs themeId from the settings store to the
 * <html data-theme="…"> attribute so CSS variable overrides take effect.
 *
 * Every theme has an explicit html[data-theme="X"] block in index.css.
 * The :root block is the "Warm Kitchen" fallback (shown before JS hydrates).
 */
export function ThemeProvider({ children }) {
  const themeId = useSettingsStore((s) => s.themeId);

  useEffect(() => {
    const id = themeId || "tomato";
    document.documentElement.setAttribute("data-theme", id);
  }, [themeId]);

  return <>{children}</>;
}
