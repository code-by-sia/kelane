import { BrainCircuitIcon, CheckIcon, PaletteIcon, SaladIcon, ZapIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SidebarPage from "@/pages/sidebar-page";
import { ThemePicker } from "@/components/theme-picker";
import useSetupStore from "@/store/setup";
import useSettingsStore from "@/store/settings";
import { LLM_MODELS } from "@/data/llm-models";
import "./preferences.css";

const DIETARY_OPTIONS = [
  { id: "vegan",       label: "Vegan" },
  { id: "vegetarian",  label: "Vegetarian" },
  { id: "gluten-free", label: "Gluten-free" },
  { id: "dairy-free",  label: "Dairy-free" },
  { id: "low-carb",    label: "Low-carb" },
  { id: "nut-free",    label: "Nut-free" },
  { id: "halal",       label: "Halal" },
  { id: "kosher",      label: "Kosher" },
];

const SPEED_LABELS = { fast: "Fast", medium: "Medium", slow: "Slower" };

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
      <Tabs defaultValue="appearance" className="flex flex-col flex-1 min-h-0">

        {/* ── Tab bar ── */}
        <TabsList className="prefs-tab-list">
          <TabsTrigger value="appearance" className="prefs-tab-trigger">
            <PaletteIcon size={13} />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="ai" className="prefs-tab-trigger">
            <BrainCircuitIcon size={13} />
            AI Model
          </TabsTrigger>
          <TabsTrigger value="dietary" className="prefs-tab-trigger">
            <SaladIcon size={13} />
            Dietary
          </TabsTrigger>
        </TabsList>

        {/* ── Appearance ── */}
        <TabsContent value="appearance" className="prefs-tab-content">
          <div className="prefs-tab-inner">
            <ThemePicker />
          </div>
        </TabsContent>

        {/* ── AI Model ── */}
        <TabsContent value="ai" className="prefs-tab-content">
          <div className="prefs-tab-inner--gap">
            <p className="text-sm text-muted-foreground">
              Used by the recipe scanner to extract recipes from text. Models run
              entirely on your device — nothing is sent to the cloud. The first
              use downloads and caches the model locally.
            </p>
            <div className="flex flex-col gap-2">
              {LLM_MODELS.map((model) => {
                const active = modelId === model.id;
                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => setModel(model.id)}
                    className={`prefs-model-card ${active ? "prefs-model-card--active" : "prefs-model-card--idle"}`}
                  >
                    <div className={`prefs-model-radio ${active ? "prefs-model-radio--active" : "prefs-model-radio--idle"}`}>
                      {active && <CheckIcon size={12} className="text-primary-foreground" strokeWidth={3} />}
                    </div>

                    <div className="prefs-model-meta">
                      <div className="prefs-model-name-row">
                        <span className="prefs-model-name">{model.name}</span>
                        <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-mono">
                          {model.size}
                        </Badge>
                      </div>
                      <span className="prefs-model-desc">{model.description}</span>
                    </div>

                    <div className="prefs-model-speed">
                      <ZapIcon size={12} className={
                        model.speed === "fast"   ? "text-green-500" :
                        model.speed === "medium" ? "text-amber-500" :
                                                   "text-muted-foreground"
                      } />
                      <span className="text-xs text-muted-foreground">{SPEED_LABELS[model.speed]}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* ── Dietary preferences ── */}
        <TabsContent value="dietary" className="prefs-tab-content">
          <div className="prefs-tab-inner--gap">
            <p className="text-sm text-muted-foreground">
              Kelane uses these to highlight suitable recipes.
            </p>
            <div className="prefs-dietary-grid">
              {DIETARY_OPTIONS.map(({ id, label }) => (
                <label
                  key={id}
                  className={`prefs-dietary-label ${dietaryTags.includes(id) ? "prefs-dietary-label--active" : "prefs-dietary-label--idle"}`}
                >
                  <Checkbox
                    checked={dietaryTags.includes(id)}
                    onCheckedChange={() => toggleTag(id)}
                  />
                  <Label className="cursor-pointer font-normal">{label}</Label>
                </label>
              ))}
            </div>
          </div>
        </TabsContent>

      </Tabs>
    </SidebarPage>
  );
}
