import { Button } from "@/components/ui/button";
import { ThemePicker } from "@/components/theme-picker";
import useSettingsStore from "@/store/settings";
import { THEMES } from "@/data/themes";

export default function AppearanceSetup({ onNext }) {
  const themeId = useSettingsStore((s) => s.themeId);
  const currentTheme = THEMES.find((t) => t.id === themeId);

  return (
    <div className="flex flex-col justify-center min-h-full max-w-2xl mx-auto gap-6">
      <div>
        <h1 className="text-2xl font-light mb-1">Choose your style</h1>
        <p className="text-muted-foreground text-sm">
          Pick a theme for Kelane. Changes apply instantly — you can always
          update this later in Preferences.
        </p>
      </div>

      <ThemePicker />

      {currentTheme && (
        <p className="text-xs text-muted-foreground -mt-1">
          Selected:{" "}
          <span className="font-medium text-foreground">{currentTheme.name}</span>{" "}
          — {currentTheme.description}
        </p>
      )}

      <div className="flex justify-end">
        <Button onClick={onNext}>Continue</Button>
      </div>
    </div>
  );
}
