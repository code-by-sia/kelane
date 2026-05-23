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

        {/* ── Tab bar — sits in the tinted toolbar band ── */}
        <TabsList className="w-full justify-start rounded-none border-b bg-background px-4 lg:px-6 h-11 gap-1 shrink-0">
          <TabsTrigger value="appearance" className="gap-1.5 data-[state=active]:shadow-none">
            <PaletteIcon size={13} />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-1.5 data-[state=active]:shadow-none">
            <BrainCircuitIcon size={13} />
            AI Model
          </TabsTrigger>
          <TabsTrigger value="dietary" className="gap-1.5 data-[state=active]:shadow-none">
            <SaladIcon size={13} />
            Dietary
          </TabsTrigger>
        </TabsList>

        {/* ── Appearance ── */}
        <TabsContent value="appearance" className="flex-1 overflow-y-auto mt-0">
          <div className="p-4 sm:p-6 max-w-2xl">
            <ThemePicker />
          </div>
        </TabsContent>

        {/* ── AI Model ── */}
        <TabsContent value="ai" className="flex-1 overflow-y-auto mt-0">
          <div className="p-4 sm:p-6 max-w-2xl flex flex-col gap-4">
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
                    className={`flex items-center gap-4 p-4 rounded-xl border text-left cursor-pointer transition-colors ${
                      active
                        ? "border-primary/50 bg-primary/8"
                        : "border-border bg-card hover:bg-accent"
                    }`}
                  >
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
        <TabsContent value="dietary" className="flex-1 overflow-y-auto mt-0">
          <div className="p-4 sm:p-6 max-w-2xl flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
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
          </div>
        </TabsContent>

      </Tabs>
    </SidebarPage>
  );
}
