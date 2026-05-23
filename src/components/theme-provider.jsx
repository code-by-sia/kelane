import { useEffect } from "react";
import useSettingsStore from "@/store/settings";

/**
 * ThemeProvider — syncs themeId from the settings store to the
 * <html data-theme="…"> attribute so CSS variable overrides take effect,
 * and keeps the PWA title-bar <meta name="theme-color"> in step.
 *
 * Every theme has an explicit html[data-theme="X"] block in index.css.
 * The :root block is the "Warm Kitchen" fallback (shown before JS hydrates).
 */
export function ThemeProvider({ children }) {
  const themeId = useSettingsStore((s) => s.themeId);

  useEffect(() => {
    const id = themeId || "tomato";
    document.documentElement.setAttribute("data-theme", id);

    // Sync the PWA/browser title-bar colour to the sidebar background.
    // rAF ensures the newly applied data-theme CSS is computed before we read
    // it back. We apply the raw CSS value to a hidden probe element so the
    // browser normalises oklch/hsl/etc. → rgb() for us.
    requestAnimationFrame(() => {
      const raw = getComputedStyle(document.documentElement)
        .getPropertyValue("--sidebar")
        .trim();
      if (!raw) return;

      const probe = document.createElement("span");
      probe.style.cssText = `position:fixed;display:block;visibility:hidden;color:${raw}`;
      document.body.appendChild(probe);
      const resolved = getComputedStyle(probe).color;
      probe.remove();

      if (resolved) {
        document.querySelector('meta[name="theme-color"]')
          ?.setAttribute("content", resolved);
      }
    });
  }, [themeId]);

  return <>{children}</>;
}
