import { useState } from "react";
import { addDays, addMonths, addWeeks, addYears, format, parseISO, differenceInDays } from "date-fns";
import { CalendarIcon, XIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const PRESETS = [
  { label: "+1w",  fn: (d) => addWeeks(d, 1) },
  { label: "+2w",  fn: (d) => addWeeks(d, 2) },
  { label: "+1m",  fn: (d) => addMonths(d, 1) },
  { label: "+3m",  fn: (d) => addMonths(d, 3) },
  { label: "+6m",  fn: (d) => addMonths(d, 6) },
  { label: "+1y",  fn: (d) => addYears(d, 1) },
];

function toDateString(d) {
  return format(d, "yyyy-MM-dd");
}

function isPresetActive(value, preset) {
  if (!value) return false;
  const expected = toDateString(preset.fn(new Date()));
  return value === expected;
}

function fuzzyLabel(value) {
  if (!value) return null;
  const days = differenceInDays(parseISO(value), new Date());
  if (days < 0) return "Expired";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 7) return `${days} days`;
  if (days < 30) return `${Math.round(days / 7)} weeks`;
  if (days < 365) return `${Math.round(days / 30)} months`;
  return `${Math.round(days / 365)} year${Math.round(days / 365) !== 1 ? "s" : ""}`;
}

/**
 * SmartExpiryPicker — compact expiry date selector.
 *
 * Props:
 *   value       string | null   "yyyy-MM-dd" or null
 *   onChange    (value: string | null) => void
 *   className   optional extra classes on the wrapper
 */
export function SmartExpiryPicker({ value, onChange, className = "" }) {
  const [showCustom, setShowCustom] = useState(false);

  const applyPreset = (preset) => {
    onChange(toDateString(preset.fn(new Date())));
    setShowCustom(false);
  };

  const handleCustomChange = (e) => {
    onChange(e.target.value || null);
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {/* Current value pill */}
      {value && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarIcon size={11} />
          <span>
            {fuzzyLabel(value)}
            <span className="opacity-60 ml-1">({value})</span>
          </span>
        </div>
      )}

      {/* Preset chips */}
      <div className="flex flex-wrap gap-1">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => applyPreset(p)}
            className={`px-2 py-0.5 rounded-full text-xs border transition-colors cursor-pointer
              ${isPresetActive(value, p)
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background hover:bg-accent border-border text-foreground"
              }`}
          >
            {p.label}
          </button>
        ))}

        <button
          type="button"
          onClick={() => setShowCustom((s) => !s)}
          className={`px-2 py-0.5 rounded-full text-xs border transition-colors cursor-pointer
            ${showCustom
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background hover:bg-accent border-border text-foreground"
            }`}
        >
          Custom…
        </button>

        {value && (
          <button
            type="button"
            onClick={() => { onChange(null); setShowCustom(false); }}
            className="px-2 py-0.5 rounded-full text-xs border border-border bg-background hover:bg-destructive/10 hover:border-destructive/40 text-muted-foreground hover:text-destructive transition-colors cursor-pointer flex items-center gap-0.5"
          >
            <XIcon size={10} /> Clear
          </button>
        )}
      </div>

      {/* Custom date input */}
      {showCustom && (
        <Input
          type="date"
          className="h-7 text-xs"
          value={value ?? ""}
          onChange={handleCustomChange}
          autoFocus
        />
      )}
    </div>
  );
}
