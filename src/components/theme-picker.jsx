import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import useSettingsStore from "@/store/settings";
import { THEMES } from "@/data/themes";

// ── Individual swatch card ─────────────────────────────────────────────────────
export function ThemeCard({ theme, active, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(theme.id)}
      className={cn(
        "relative flex flex-col rounded-xl border-2 overflow-hidden cursor-pointer transition-all text-left",
        active
          ? "border-primary shadow-md ring-2 ring-primary/20"
          : "border-border hover:border-muted-foreground/40 hover:shadow-sm",
      )}
    >
      {/* Mini app-frame preview */}
      <div className="flex h-16">
        {/* Sidebar strip */}
        <div className="w-9 shrink-0" style={{ background: theme.swatchSidebar }} />
        {/* Content area */}
        <div
          className="flex-1 flex items-end p-2 gap-1.5"
          style={{ background: theme.swatchBg }}
        >
          {/* Simulated primary button */}
          <div
            className="h-3.5 w-12 rounded-md"
            style={{ background: theme.swatchPrimary }}
          />
          {/* Simulated secondary element */}
          <div
            className="h-2.5 w-8 rounded"
            style={{ background: theme.swatchPrimary, opacity: 0.25 }}
          />
        </div>
      </div>

      {/* Name & description */}
      <div className="px-3 py-2 bg-card border-t">
        <p className="text-sm font-medium leading-tight">{theme.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{theme.description}</p>
      </div>

      {/* Active checkmark */}
      {active && (
        <div className="absolute top-2 right-2 size-5 rounded-full bg-primary flex items-center justify-center shadow-sm">
          <CheckIcon size={11} className="text-primary-foreground" strokeWidth={2.5} />
        </div>
      )}
    </button>
  );
}

// ── Picker grid (reads/writes the settings store) ─────────────────────────────
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
