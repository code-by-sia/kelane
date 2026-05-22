import { useRef, useState } from "react";
import { ArrowRightIcon, GlobeIcon, RefreshCwIcon, TriangleAlertIcon, UtensilsIcon } from "lucide-react";
import { toast } from "sonner";
import SidebarPage from "@/pages/sidebar-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const BLOCKED_PLACEHOLDER = "about:blank";

function normalizeUrl(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export default function BrowserPage() {
  const [inputVal, setInputVal] = useState("");
  const [currentUrl, setCurrentUrl] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const iframeRef = useRef(null);

  const navigate = (raw) => {
    const url = normalizeUrl(raw);
    if (!url) return;
    setBlocked(false);
    setLoading(true);
    setCurrentUrl(url);
    setInputVal(url);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(inputVal);
  };

  const handleLoad = () => {
    setLoading(false);
    // Check if iframe is showing blank (blocked by X-Frame-Options)
    try {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentDocument?.URL === "about:blank" && currentUrl) {
        setBlocked(true);
      }
    } catch {
      // Cross-origin — iframe loaded but we can't inspect the document
      setBlocked(false);
    }
  };

  const handleError = () => {
    setLoading(false);
    setBlocked(true);
  };

  const extractRecipe = () => {
    // TODO: integrate WebLLM (task 012) to read iframe content and extract recipe
    toast.info(
      "WebLLM recipe extraction is not yet integrated. This will use an in-browser AI model to parse the page content into a structured recipe.",
      { duration: 5000 },
    );
  };

  const refresh = () => {
    if (!currentUrl) return;
    setBlocked(false);
    setLoading(true);
    // Re-trigger iframe load by briefly setting to blank then back
    setCurrentUrl("");
    setTimeout(() => setCurrentUrl(currentUrl), 50);
  };

  return (
    <SidebarPage>
      <div className="flex flex-col h-full" style={{ height: "100svh" }}>
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-3 py-2 border-b bg-background shrink-0">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={refresh}
            disabled={!currentUrl}
            title="Refresh"
          >
            <RefreshCwIcon size={14} className={loading ? "animate-spin" : ""} />
          </Button>

          <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2">
            <div className="flex-1 relative">
              <GlobeIcon
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                className="pl-8 h-8 text-sm"
                placeholder="Enter a URL, e.g. bbcgoodfood.com/recipes/…"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
              />
            </div>
            <Button type="submit" size="sm" variant="outline">
              <ArrowRightIcon size={14} /> Go
            </Button>
          </form>

          <Button
            size="sm"
            variant="default"
            onClick={extractRecipe}
            disabled={!currentUrl || blocked}
            title="Extract recipe from this page using AI"
          >
            <UtensilsIcon size={14} />
            Extract Recipe
          </Button>
        </div>

        {/* Content area */}
        <div className="flex-1 relative overflow-hidden">
          {!currentUrl && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <GlobeIcon size={48} strokeWidth={0.6} />
              <p className="text-sm">Navigate to a recipe page, then click <strong>Extract Recipe</strong>.</p>
              <div className="flex flex-wrap justify-center gap-2 max-w-md">
                {[
                  "bbcgoodfood.com",
                  "seriouseats.com",
                  "allrecipes.com",
                ].map((site) => (
                  <Button
                    key={site}
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`https://${site}`)}
                  >
                    {site}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {blocked && currentUrl && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <TriangleAlertIcon size={40} strokeWidth={0.8} className="text-amber-400" />
              <p className="font-medium text-foreground">This site can't be shown in a frame</p>
              <p className="text-sm text-center max-w-sm">
                {currentUrl} blocks embedding via{" "}
                <code className="text-xs bg-muted px-1 rounded">X-Frame-Options</code>.
                Open it in a new tab instead.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(currentUrl, "_blank")}
                >
                  Open in new tab
                </Button>
              </div>
            </div>
          )}

          {currentUrl && !blocked && (
            <iframe
              ref={iframeRef}
              src={currentUrl}
              className="w-full h-full border-0"
              onLoad={handleLoad}
              onError={handleError}
              title="Recipe browser"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          )}
        </div>
      </div>
    </SidebarPage>
  );
}
