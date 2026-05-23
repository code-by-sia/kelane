import { useRef, useState } from "react";
import {
  ArrowRightIcon,
  GlobeIcon,
  RefreshCwIcon,
  Settings2Icon,
  ShieldOffIcon,
  UtensilsIcon,
} from "lucide-react";
import SidebarPage from "@/pages/sidebar-page";
import { RecipeScanner } from "@/components/recipe-scanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import useSettingsStore, {
  PROXY_PRESETS,
  getProxyPrefix,
} from "@/store/settings";

function normalizeUrl(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

// ── Proxy settings popover ─────────────────────────────────────────────────
function ProxySettings() {
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
                proxyPresetId === preset.id
                  ? "border-primary bg-primary/5"
                  : "hover:bg-muted/50"
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
                  proxyPresetId === preset.id
                    ? "border-primary bg-primary"
                    : "border-muted-foreground"
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
            <code className="block mt-1 font-mono text-foreground">
              npm run proxy
            </code>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
const QUICK_SITES = ["bbcgoodfood.com", "seriouseats.com", "allrecipes.com"];

export default function BrowserPage() {
  const settingsState = useSettingsStore();
  const proxyPresetId = useSettingsStore((s) => s.proxyPresetId);
  const customProxyPrefix = useSettingsStore((s) => s.customProxyPrefix);
  const setProxyPreset = useSettingsStore((s) => s.setProxyPreset);
  const setCustomProxyPrefix = useSettingsStore((s) => s.setCustomProxyPrefix);
  const proxyPrefix = getProxyPrefix(settingsState);
  const activePreset = PROXY_PRESETS.find((p) => p.id === proxyPresetId) ?? PROXY_PRESETS[0];

  const [inputVal, setInputVal] = useState("");
  const [targetUrl, setTargetUrl] = useState(""); // the real URL the user wants
  const [blocked, setBlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usingProxy, setUsingProxy] = useState(false);
  const iframeRef = useRef(null);

  /** Build the URL to load in the iframe — raw or proxied */
  function iframeUrl(url, withProxy) {
    if (!url) return "";
    return withProxy ? `${proxyPrefix}${encodeURIComponent(url)}` : url;
  }

  const [iframeSrc, setIframeSrc] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);

  const navigate = (raw, withProxy = false) => {
    const url = normalizeUrl(raw);
    if (!url) return;
    setBlocked(false);
    setLoading(true);
    setTargetUrl(url);
    setInputVal(url);
    setUsingProxy(withProxy);
    setIframeSrc(iframeUrl(url, withProxy));
  };

  const loadViaProxy = () => navigate(targetUrl, true);

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(inputVal, usingProxy);
  };

  const handleLoad = () => {
    setLoading(false);
    try {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentDocument?.URL === "about:blank" && targetUrl) {
        setBlocked(true);
      }
    } catch {
      // Cross-origin — loaded successfully, we just can't inspect it
      setBlocked(false);
    }
  };

  const handleError = () => {
    setLoading(false);
    setBlocked(true);
  };

  const refresh = () => {
    if (!targetUrl) return;
    setBlocked(false);
    setLoading(true);
    const src = iframeUrl(targetUrl, usingProxy);
    setIframeSrc("");
    setTimeout(() => setIframeSrc(src), 30);
  };

  const extractRecipe = () => {
    setScannerOpen(true);
  };

  return (
    <>
    <SidebarPage>
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* ── Toolbar ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 border-b bg-background shrink-0">
          <Button variant="ghost" size="icon-sm" onClick={refresh} disabled={!targetUrl} title="Refresh">
            <RefreshCwIcon size={14} className={loading ? "animate-spin" : ""} />
          </Button>

          <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-1 sm:gap-2 min-w-0">
            <div className="flex-1 relative min-w-0">
              {usingProxy && targetUrl ? (
                <ShieldOffIcon size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-amber-500" title="Loading via proxy" />
              ) : (
                <GlobeIcon size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              )}
              <Input
                className="pl-8 h-8 text-sm"
                placeholder="bbcgoodfood.com/recipes/…"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
              />
            </div>
            <Button type="submit" size="sm" variant="outline" className="shrink-0">
              <ArrowRightIcon size={14} />
              <span className="hidden sm:inline">Go</span>
            </Button>
          </form>

          {/* Proxy badge when active */}
          {usingProxy && targetUrl && (
            <span className="text-xs text-amber-600 font-medium shrink-0 flex items-center gap-1 hidden sm:flex">
              <ShieldOffIcon size={11} /> proxy
            </span>
          )}

          {/* Extract Recipe — label on desktop, icon-only on mobile */}
          <Button size="sm" variant="default" onClick={extractRecipe} disabled={!targetUrl || blocked} title="Extract recipe from this page using AI" className="shrink-0">
            <UtensilsIcon size={14} />
            <span className="hidden sm:inline">Extract Recipe</span>
          </Button>

          <ProxySettings />
        </div>

        {/* ── Content area ────────────────────────────────────────────── */}
        <div className="flex-1 relative overflow-hidden">
          {/* Empty state */}
          {!targetUrl && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <GlobeIcon size={48} strokeWidth={0.6} />
              <p className="text-sm">
                Navigate to a recipe page, then click{" "}
                <strong>Extract Recipe</strong>.
              </p>
              <div className="flex flex-wrap justify-center gap-2 max-w-md">
                {QUICK_SITES.map((site) => (
                  <Button
                    key={site}
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`https://${site}`, usingProxy)}
                  >
                    {site}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Blocked by X-Frame-Options — proxy picker */}
          {blocked && targetUrl && (
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
              <div className="w-full max-w-sm flex flex-col gap-4">
                <div className="flex flex-col items-center gap-2 text-center">
                  <ShieldOffIcon size={36} strokeWidth={0.8} className="text-amber-400" />
                  <p className="font-medium text-foreground">This site blocks embedding</p>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    <span className="font-mono text-xs bg-muted px-1 rounded">X-Frame-Options</span>{" "}
                    prevents loading <strong>{new URL(targetUrl).hostname}</strong> directly.
                    Route it through a CORS proxy to load it here.
                  </p>
                </div>

                {/* Proxy preset selector */}
                <div className="flex flex-col gap-1.5">
                  {PROXY_PRESETS.map((preset) => (
                    <label
                      key={preset.id}
                      className={`flex items-start gap-2.5 rounded-lg border p-2.5 cursor-pointer transition-colors ${
                        proxyPresetId === preset.id
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="blocked-proxy"
                        className="sr-only"
                        checked={proxyPresetId === preset.id}
                        onChange={() => setProxyPreset(preset.id)}
                      />
                      <div
                        className={`mt-0.5 w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                          proxyPresetId === preset.id
                            ? "border-primary bg-primary"
                            : "border-muted-foreground"
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

                {/* Custom proxy input */}
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

                {/* Local proxy hint */}
                {proxyPresetId === "local" && (
                  <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                    Start the proxy in a separate terminal:
                    <code className="block mt-1 font-mono text-foreground">npm run proxy</code>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" onClick={loadViaProxy}>
                    <ShieldOffIcon size={13} />
                    Load via {activePreset.label.replace(" (recommended)", "")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(targetUrl, "_blank")}
                  >
                    Open in new tab
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Iframe */}
          {iframeSrc && !blocked && (
            <iframe
              ref={iframeRef}
              src={iframeSrc}
              className="w-full h-full border-0"
              onLoad={handleLoad}
              onError={handleError}
              title="Recipe browser"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            />
          )}
        </div>
      </div>
    </SidebarPage>
    <RecipeScanner
      open={scannerOpen}
      onClose={() => setScannerOpen(false)}
      initialUrl={targetUrl}
    />
    </>
  );
}
