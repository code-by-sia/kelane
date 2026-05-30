import { BrainCircuitIcon, BotIcon, CheckIcon, DatabaseIcon, FlameIcon, GlobeIcon, PaletteIcon, SaladIcon, ZapIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SidebarPage from "@/pages/sidebar-page";
import { ThemePicker } from "@/components/theme-picker";
import useSetupStore from "@/store/setup";
import useSettingsStore, { PROXY_PRESETS } from "@/store/settings";
import { LLM_MODELS, SPEED_COLOR, SPEED_LABEL } from "@/data/llm-models";
import "./preferences.css";
import { DataTab } from "./data-tab";

/** Reusable model picker card list */
function ModelCards({ activeId, onSelect }) {
  return (
    <div className="flex flex-col gap-2">
      {LLM_MODELS.map((model) => {
        const active = activeId === model.id;
        return (
          <button
            key={model.id}
            type="button"
            onClick={() => onSelect(model.id)}
            className={`prefs-model-card ${active ? "prefs-model-card--active" : "prefs-model-card--idle"}`}
          >
            <div className={`prefs-model-radio ${active ? "prefs-model-radio--active" : "prefs-model-radio--idle"}`}>
              {active && <CheckIcon size={12} className="text-primary-foreground" strokeWidth={3} />}
            </div>
            <div className="prefs-model-meta">
              <div className="prefs-model-name-row">
                <span className="prefs-model-name">{model.name}</span>
                {model.badge && (
                  <Badge className="text-[10px] h-4 px-1.5 bg-primary/15 text-primary border-transparent">
                    {model.badge}
                  </Badge>
                )}
                <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-mono ml-auto">
                  {model.vram}
                </Badge>
              </div>
              <span className="prefs-model-desc">{model.description}</span>
            </div>
            <div className="prefs-model-speed">
              <ZapIcon size={12} className={SPEED_COLOR[model.speed]} />
              <span className="text-xs text-muted-foreground">{SPEED_LABEL[model.speed]}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

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

const CHEF_STYLES = [
  { label: "Precise",  value: 0.4,  icon: CheckIcon,  hint: "Focused answers" },
  { label: "Balanced", value: 0.72, icon: ZapIcon,     hint: "Default" },
  { label: "Creative", value: 1.1,  icon: FlameIcon,   hint: "More inventive" },
];

export default function PreferencesPage() {
  const dietaryTags = useSetupStore((s) => s.preferences.dietaryTags);
  const setDietaryTags = useSetupStore((s) => s.setDietaryTags);
  const modelId          = useSettingsStore((s) => s.modelId);
  const setModel         = useSettingsStore((s) => s.setModel);
  const scannerModelId   = useSettingsStore((s) => s.scannerModelId);
  const setScannerModel  = useSettingsStore((s) => s.setScannerModel);
  const chefTemperature  = useSettingsStore((s) => s.chefTemperature) ?? 0.72;
  const setChefTemperature = useSettingsStore((s) => s.setChefTemperature);
  const proxyPresetId    = useSettingsStore((s) => s.proxyPresetId);
  const customProxyPrefix = useSettingsStore((s) => s.customProxyPrefix);
  const setProxyPreset = useSettingsStore((s) => s.setProxyPreset);
  const setCustomProxyPrefix = useSettingsStore((s) => s.setCustomProxyPrefix);

  const toggleTag = (id) =>
    setDietaryTags(
      dietaryTags.includes(id)
        ? dietaryTags.filter((t) => t !== id)
        : [...dietaryTags, id],
    );

  return (
    <SidebarPage title="Preferences">
      <Tabs defaultValue="appearance" className="flex flex-col flex-1 min-h-0">

        <div className="px-4 lg:px-6 py-3 shrink-0">
          <TabsList>
            <TabsTrigger value="appearance">
              <PaletteIcon size={13} />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="ai">
              <BrainCircuitIcon size={13} />
              AI
            </TabsTrigger>
            <TabsTrigger value="dietary">
              <SaladIcon size={13} />
              Dietary
            </TabsTrigger>
            <TabsTrigger value="network">
              <GlobeIcon size={13} />
              Network
            </TabsTrigger>
            <TabsTrigger value="data">
              <DatabaseIcon size={13} />
              Data
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="appearance" className="prefs-tab-content">
          <div className="prefs-tab-inner">
            <ThemePicker />
          </div>
        </TabsContent>

        <TabsContent value="ai" className="prefs-tab-content">
          <div className="prefs-tab-inner--gap">

            {/* ── Kejal assistant model ── */}
            <div>
              <p className="text-sm font-medium mb-0.5">Kejal assistant model</p>
              <p className="text-sm text-muted-foreground">
                Used for the in-app chat assistant. Runs entirely on your device
                via WebGPU — no data leaves the browser. Downloaded and cached on
                first use.
              </p>
            </div>
            <ModelCards activeId={modelId} onSelect={setModel} />

            <hr className="border-border" />

            {/* ── Recipe scanner model ── */}
            <div>
              <p className="text-sm font-medium mb-0.5">Recipe scanner model</p>
              <p className="text-sm text-muted-foreground">
                Used when extracting a recipe from a URL or pasted text. Can be
                different from the chat model — a smaller model is often enough
                for structured extraction.
              </p>
            </div>
            <ModelCards activeId={scannerModelId} onSelect={setScannerModel} />

            <hr className="border-border" />

            {/* ── Hejar assistant ── */}
            <div className="flex items-center gap-2">
              <BotIcon size={15} className="text-muted-foreground shrink-0" />
              <p className="text-sm font-medium">Kejal assistant</p>
            </div>

            {/* Response style (temperature) */}
            <div className="flex flex-col gap-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Response style</p>
              <div className="flex gap-2">
                {CHEF_STYLES.map(({ label, value, icon: Icon, hint }) => {
                  const active = chefTemperature === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setChefTemperature(value)}
                      className={`prefs-style-card ${active ? "prefs-style-card--active" : "prefs-style-card--idle"}`}
                    >
                      <Icon size={16} className={active ? "text-primary" : "text-muted-foreground"} />
                      <span className="text-sm font-medium">{label}</span>
                      <span className="text-[11px] text-muted-foreground">{hint}</span>
                    </button>
                  );
                })}
              </div>
            </div>


          </div>
        </TabsContent>

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

        <TabsContent value="network" className="prefs-tab-content">
          <div className="prefs-tab-inner--gap">
            <div>
              <p className="text-sm font-medium mb-0.5">CORS Proxy</p>
              <p className="text-sm text-muted-foreground">
                Used when fetching RSS feeds or recipe pages that block direct browser access.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {PROXY_PRESETS.map((preset) => {
                const active = proxyPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setProxyPreset(preset.id)}
                    className={`prefs-model-card ${active ? "prefs-model-card--active" : "prefs-model-card--idle"}`}
                  >
                    <div className={`prefs-model-radio ${active ? "prefs-model-radio--active" : "prefs-model-radio--idle"}`}>
                      {active && <CheckIcon size={12} className="text-primary-foreground" strokeWidth={3} />}
                    </div>
                    <div className="prefs-model-meta">
                      <div className="prefs-model-name-row">
                        <span className="prefs-model-name">{preset.label}</span>
                        {preset.id === "allorigins" && (
                          <Badge variant="outline" className="text-[10px] h-4 px-1.5">default</Badge>
                        )}
                      </div>
                      {preset.hint && <span className="prefs-model-desc">{preset.hint}</span>}
                      {preset.prefix && <span className="prefs-model-desc font-mono">{preset.prefix}</span>}
                    </div>
                  </button>
                );
              })}
            </div>

            {proxyPresetId === "custom" && (
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Proxy prefix URL</Label>
                <Input
                  placeholder="https://my-proxy.example.com/?url="
                  value={customProxyPrefix}
                  onChange={(e) => setCustomProxyPrefix(e.target.value)}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  The target URL will be appended (URL-encoded) to this prefix.
                </p>
              </div>
            )}

            {proxyPresetId === "local" && (
              <div className="prefs-proxy-hint">
                <p className="text-xs text-muted-foreground">Start the local proxy in a terminal:</p>
                <code className="prefs-proxy-code">npm run proxy</code>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="data" className="prefs-tab-content">
          <DataTab />
        </TabsContent>

      </Tabs>
    </SidebarPage>
  );
}
