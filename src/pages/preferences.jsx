import { BrainCircuitIcon, CheckIcon, PaletteIcon, SaladIcon, ZapIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import SidebarPage from "@/pages/sidebar-page";
import { ThemePicker } from "@/components/theme-picker";
import useSetupStore from "@/store/setup";
import useSettingsStore from "@/store/settings";
import { LLM_MODELS } from "@/data/llm-models";

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

const SPEED_LABELS = { fast: "Fast", medium: "Medium", slow: "Slower" };

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PreferencesPage() {
  const dietaryTags = useSetupStore((s) => s.preferences.dietaryTags);
  const setDietaryTags = useSetupStore((s) => s.setDietaryTags);

  const modelId = useSettingsStore((s) => s.modelId);
  const setModel = useSettingsStore((s) => s.setModel);

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

        {/* ── AI model ── */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <BrainCircuitIcon size={15} className="text-muted-foreground" />
            <h2 className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
              AI Model
            </h2>
          </div>
          <p className="text-sm text-muted-foreground -mt-2">
            Used by the recipe scanner to extract recipes from text. Models run
            entirely on your device — nothing is sent to the cloud. The first
            use downloads the model and caches it locally.
          </p>
          <div className="flex flex-col gap-2">
            {LLM_MODELS.map((model) => {
              const active = modelId === model.id;
              return (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => setModel(model.id)}
                  className={`flex items-center gap-4 p-4 rounded-xl border text-left cursor-pointer transition-colors ${
                    active
                      ? "border-primary/50 bg-primary/8"
                      : "border-border bg-card hover:bg-accent"
                  }`}
                >
                  {/* Active indicator */}
                  <div className={`size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    active ? "border-primary bg-primary" : "border-muted-foreground/40"
                  }`}>
                    {active && <CheckIcon size={12} className="text-primary-foreground" strokeWidth={3} />}
                  </div>

                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{model.name}</span>
                      <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-mono">
                        {model.size}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground mt-0.5">{model.description}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <ZapIcon size={12} className={`${
                      model.speed === "fast" ? "text-green-500" :
                      model.speed === "medium" ? "text-amber-500" : "text-muted-foreground"
                    }`} />
                    <span className="text-xs text-muted-foreground">{SPEED_LABELS[model.speed]}</span>
                  </div>
                </button>
              );
            })}
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
