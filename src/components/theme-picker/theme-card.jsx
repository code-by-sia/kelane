import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeCard({ theme, active, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(theme.id)}
      className={cn("theme-card", active ? "theme-card--active" : "theme-card--idle")}
    >
      {/* Mini app-frame preview */}
      <div className="theme-card__preview">
        {/* Sidebar strip */}
        <div className="theme-card__sidebar" style={{ background: theme.swatchSidebar }} />
        {/* Content area */}
        <div className="theme-card__content" style={{ background: theme.swatchBg }}>
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
      <div className="theme-card__label">
        <p className="text-sm font-medium leading-tight">{theme.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{theme.description}</p>
      </div>

      {/* Active checkmark */}
      {active && (
        <div className="theme-card__check">
          <CheckIcon size={11} className="text-primary-foreground" strokeWidth={2.5} />
        </div>
      )}
    </button>
  );
}
