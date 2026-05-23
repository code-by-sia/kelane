import { CheckIcon, PaletteIcon, SaladIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import SidebarPage from "@/pages/sidebar-page";
import useSettingsStore from "@/store/settings";
import useSetupStore from "@/store/setup";

// ── Theme definitions ─────────────────────────────────────────────────────────
const THEMES = [
  {
    id: "warm-kitchen",
    name: "Warm Kitchen",
    description: "Amber & espresso",
    swatchPrimary: "oklch(0.769 0.188 70.08)",
    swatchSidebar: "oklch(0.155 0.040 25)",
  },
  {
    id: "tomato",
    name: "Tomato",
    description: "Bold crimson red",
    swatchPrimary: "oklch(0.586 0.253 17.585)",
    swatchSidebar: "oklch(0.125 0.042 17)",
  },
];

// ── Dietary options (shared with setup flow) ──────────────────────────────────
const DIETARY_OPTIONS = [
  { id: "vegan", label: "Vegan" },
  { id: "vegetarian", label: "Vegetarian" },
  { id: "gluten-free", label: "Gluten-free" },
  { id: "dairy-free", label: "Dairy-free" },
  { id: "low-carb", label: "Low-carb" },
  { id: "nut-free", label: "Nut-free" },
  { id: "halal", label: "Halal" },
  { id: "kosher", label: "Kosher" },
];

// ── Theme swatch card ─────────────────────────────────────────────────────────
function ThemeCard({ theme, active, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(theme.id)}
      className={`relative flex flex-col rounded-xl border-2 overflow-hidden cursor-pointer transition-all text-left ${
        active
          ? "border-primary shadow-md ring-2 ring-primary/20"
          : "border-border hover:border-muted-foreground/40 hover:shadow-sm"
      }`}
    >
      {/* Mini app-frame preview */}
      <div className="flex h-16">
        <div className="w-9 shrink-0" style={{ background: theme.swatchSidebar }} />
        <div
          className="flex-1 flex items-end p-2"
          style={{ background: "oklch(0.99 0.004 85)" }}
        >
          <div
            className="h-3.5 w-14 rounded-md"
            style={{ background: theme.swatchPrimary }}
          />
        </div>
      </div>

      {/* Label */}
      <div className="px-3 py-2 bg-card border-t">
        <p className="text-sm font-medium leading-tight">{theme.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{theme.description}</p>
      </div>

      {/* Active indicator */}
      {active && (
        <div className="absolute top-2 right-2 size-5 rounded-full bg-primary flex items-center justify-center">
          <CheckIcon size={11} className="text-primary-foreground" />
        </div>
      )}
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PreferencesPage() {
  const themeId = useSettingsStore((s) => s.themeId);
  const setTheme = useSettingsStore((s) => s.setTheme);

  const dietaryTags = useSetupStore((s) => s.preferences.dietaryTags);
  const setDietaryTags = useSetupStore((s) => s.setDietaryTags);

  const toggleTag = (id) =>
    setDietaryTags(
      dietaryTags.includes(id)
        ? dietaryTags.filter((t) => t !== id)
        : [...dietaryTags, id],
    );

  return (
    <SidebarPage title="Preferences">
      <div className="p-4 sm:p-6 max-w-2xl flex flex-col gap-10">

        {/* ── Appearance ── */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <PaletteIcon size={15} className="text-muted-foreground" />
            <h2 className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
              Appearance
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {THEMES.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                active={themeId === theme.id}
                onSelect={setTheme}
              />
            ))}
          </div>
        </section>

        {/* ── Dietary preferences ── */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <SaladIcon size={15} className="text-muted-foreground" />
            <h2 className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
              Dietary preferences
            </h2>
          </div>
          <p className="text-sm text-muted-foreground -mt-2">
            Kelane uses these to highlight suitable recipes.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {DIETARY_OPTIONS.map(({ id, label }) => (
              <label
                key={id}
                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                  dietaryTags.includes(id)
                    ? "border-primary/50 bg-primary/8"
                    : "border-border bg-card hover:bg-accent"
                }`}
              >
                <Checkbox
                  checked={dietaryTags.includes(id)}
                  onCheckedChange={() => toggleTag(id)}
                />
                <Label className="cursor-pointer font-normal">{label}</Label>
              </label>
            ))}
          </div>
        </section>

      </div>
    </SidebarPage>
  );
}
