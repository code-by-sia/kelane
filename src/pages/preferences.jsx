import { PaletteIcon, SaladIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import SidebarPage from "@/pages/sidebar-page";
import { ThemePicker } from "@/components/theme-picker";
import useSetupStore from "@/store/setup";

// ── Dietary options ───────────────────────────────────────────────────────────
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

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PreferencesPage() {
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
          <ThemePicker />
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
