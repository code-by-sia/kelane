import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Settings2Icon } from "lucide-react";
import useSettingsStore, { PROXY_PRESETS } from "@/store/settings";

export function ProxySettings() {
  const proxyPresetId = useSettingsStore((s) => s.proxyPresetId);
  const customProxyPrefix = useSettingsStore((s) => s.customProxyPrefix);
  const setProxyPreset = useSettingsStore((s) => s.setProxyPreset);
  const setCustomProxyPrefix = useSettingsStore((s) => s.setCustomProxyPrefix);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" title="Proxy settings">
          <Settings2Icon size={14} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 flex flex-col gap-3 p-4">
        <div>
          <p className="text-sm font-medium">CORS Proxy</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Routes pages through a proxy to bypass X-Frame-Options restrictions.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          {PROXY_PRESETS.map((preset) => (
            <label
              key={preset.id}
              className={`flex items-start gap-2.5 rounded-lg border p-2.5 cursor-pointer transition-colors ${
                proxyPresetId === preset.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
              }`}
            >
              <input
                type="radio"
                name="proxy"
                className="sr-only"
                checked={proxyPresetId === preset.id}
                onChange={() => setProxyPreset(preset.id)}
              />
              <div
                className={`mt-0.5 w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                  proxyPresetId === preset.id ? "border-primary bg-primary" : "border-muted-foreground"
                }`}
              >
                {proxyPresetId === preset.id && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium">{preset.label}</p>
                <p className="text-xs text-muted-foreground">{preset.hint}</p>
              </div>
            </label>
          ))}
        </div>

        {proxyPresetId === "custom" && (
          <div className="flex flex-col gap-1">
            <Label className="text-xs">Proxy prefix URL</Label>
            <Input
              placeholder="https://my-proxy.example.com/?url="
              value={customProxyPrefix}
              onChange={(e) => setCustomProxyPrefix(e.target.value)}
              className="h-8 text-xs font-mono"
            />
            <p className="text-xs text-muted-foreground">
              The target URL will be appended (URL-encoded).
            </p>
          </div>
        )}

        {proxyPresetId === "local" && (
          <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
            Start the proxy in a separate terminal:
            <code className="block mt-1 font-mono text-foreground">npm run proxy</code>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
