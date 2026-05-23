import { useEffect } from "react";
import useSettingsStore from "@/store/settings";

/**
 * ThemeProvider — reads themeId from the settings store and syncs it to the
 * <html data-theme="..."> attribute so CSS variable overrides take effect.
 *
 * The "warm-kitchen" theme is the :root default, so it removes the attribute
 * entirely; all other themes set it explicitly.
 */
export function ThemeProvider({ children }) {
  const themeId = useSettingsStore((s) => s.themeId);

  useEffect(() => {
    const html = document.documentElement;
    if (themeId && themeId !== "warm-kitchen") {
      html.setAttribute("data-theme", themeId);
    } else {
      html.removeAttribute("data-theme");
    }
  }, [themeId]);

  return <>{children}</>;
}
