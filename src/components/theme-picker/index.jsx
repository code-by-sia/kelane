import { cn } from "@/lib/utils";
import useSettingsStore from "@/store/settings";
import { THEMES } from "@/data/themes";
import { ThemeCard } from "./theme-card";
import "./theme-picker.css";

export { ThemeCard } from "./theme-card";

export function ThemePicker({ className }) {
  const themeId = useSettingsStore((s) => s.themeId);
  const setTheme = useSettingsStore((s) => s.setTheme);

  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 gap-3", className)}>
      {THEMES.map((theme) => (
        <ThemeCard
          key={theme.id}
          theme={theme}
          active={themeId === theme.id}
          onSelect={setTheme}
        />
      ))}
    </div>
  );
}
