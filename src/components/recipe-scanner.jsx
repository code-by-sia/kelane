"use client";

/**
 * RecipeScanner — dialog for extracting a recipe from a URL or pasted text
 * using an in-browser WebLLM model (no server, no API key required).
 *
 * Used by:
 *  - The sidebar "Scan recipe" button (task 007)
 *  - The Browser page "Extract Recipe" button (task 012)
 *
 * Props:
 *  open        boolean
 *  onClose     () => void
 *  initialText optional pre-filled text (Browser page passes page content)
 *  initialUrl  optional pre-filled URL
 */

import { useState, useRef } from "react";
import {
  BrainCircuitIcon,
  CheckIcon,
  ClipboardPasteIcon,
  ExternalLinkIcon,
  GlobeIcon,
  LoaderIcon,
  ScanTextIcon,
  TriangleAlertIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RecipeFormDialog } from "@/components/recipe-form";
import { useWebLLM } from "@/hooks/use-web-llm";
import useRecipeStore from "@/store/recipe";
import { getProxyPrefix } from "@/store/settings";
import useSettingsStore from "@/store/settings";

// ── WebLLM status indicator ────────────────────────────────────────────────
function LLMStatusBar({ status, progress }) {
  if (status === "idle") return null;

  const labels = {
    loading: `Downloading AI model… ${progress}%`,
    ready: "Model ready",
    extracting: "Extracting recipe…",
    error: "Model error",
    unsupported: "WebGPU not supported",
  };

  const colours = {
    loading: "text-blue-600",
    ready: "text-green-600",
    extracting: "text-amber-600",
    error: "text-red-600",
    unsupported: "text-orange-600",
  };

  return (
    <div className={`flex items-center gap-2 text-xs ${colours[status] ?? ""}`}>
      {(status === "loading" || status === "extracting") && (
        <LoaderIcon size={12} className="animate-spin shrink-0" />
      )}
      {status === "ready" && <CheckIcon size={12} className="shrink-0" />}
      {(status === "error" || status === "unsupported") && (
        <TriangleAlertIcon size={12} className="shrink-0" />
      )}
      <span>{labels[status]}</span>
      {status === "loading" && progress > 0 && (
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

// ── Extracted recipe preview ───────────────────────────────────────────────
function RecipePreview({ recipe }) {
  return (
    <div className="border rounded-lg p-4 flex flex-col gap-3 bg-muted/20">
      <div>
        <p className="font-semibold text-base">{recipe.name || "Untitled Recipe"}</p>
        {recipe.summary && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {recipe.summary}
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        {recipe.calories && <span>🔥 {recipe.calories} kcal</span>}
        {recipe.guests && <span>👥 {recipe.guests} servings</span>}
        {recipe.preperationTime && <span>⏱ {recipe.preperationTime} min</span>}
        {recipe.ingredients?.length > 0 && (
          <span>🧂 {recipe.ingredients.length} ingredients</span>
        )}
        {recipe.steps?.length > 0 && (
          <span>📋 {recipe.steps.length} steps</span>
        )}
      </div>
      {recipe.ingredients?.length > 0 && (
        <div>
          <p className="text-xs font-medium mb-1">Ingredients</p>
          <ul className="text-xs text-muted-foreground flex flex-col gap-0.5">
            {recipe.ingredients.slice(0, 5).map((ing, i) => (
              <li key={i}>· {ing}</li>
            ))}
            {recipe.ingredients.length > 5 && (
              <li className="italic">
                … and {recipe.ingredients.length - 5} more
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Main dialog ────────────────────────────────────────────────────────────
export function RecipeScanner({ open, onClose, initialText = "", initialUrl = "" }) {
  const [tab, setTab] = useState(initialText ? "text" : "url");
  const [url, setUrl] = useState(initialUrl);
  const [pastedText, setPastedText] = useState(initialText);
  const [fetchError, setFetchError] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [extracted, setExtracted] = useState(null);
  const [rawOutput, setRawOutput] = useState(null); // fallback when JSON parse fails
  const [importOpen, setImportOpen] = useState(false);

  const { extract, status, progress, errorMessage } = useWebLLM();
  const addRecipe = useRecipeStore((s) => s.addRecipe);
  const settingsState = useSettingsStore();
  const proxyPrefix = getProxyPrefix(settingsState);

  const busy =
    status === "loading" || status === "extracting" || fetching;

  // Fetch page text from a URL (tries direct first, then proxy)
  const fetchPageText = async (targetUrl) => {
    setFetching(true);
    setFetchError(null);
    try {
      let text = null;

      // Try direct
      try {
        const res = await fetch(targetUrl, {
          signal: AbortSignal.timeout(8000),
        });
        text = await res.text();
      } catch {
        // CORS or network error — try proxy
        const proxied = `${proxyPrefix}${encodeURIComponent(targetUrl)}`;
        const res = await fetch(proxied, {
          signal: AbortSignal.timeout(12000),
        });
        if (!res.ok) throw new Error(`Proxy returned HTTP ${res.status}`);
        text = await res.text();
      }

      // Strip HTML tags and collapse whitespace
      const stripped = text
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim();

      setFetching(false);
      return stripped;
    } catch (err) {
      setFetchError(err?.message ?? "Could not fetch the page");
      setFetching(false);
      return null;
    }
  };

  const runExtraction = async (text) => {
    setExtracted(null);
    setRawOutput(null);
    try {
      const result = await extract(text);
      setExtracted(result);
    } catch {
      // JSON parse failed — show raw output for manual editing
      setRawOutput("Extraction failed. Please switch to the Text tab, paste the recipe manually, and try again.");
    }
  };

  const handleScanUrl = async () => {
    const text = await fetchPageText(url);
    if (text) await runExtraction(text);
  };

  const handleScanText = async () => {
    if (!pastedText.trim()) return;
    await runExtraction(pastedText);
  };

  const handleImportDirect = () => {
    if (!extracted) return;
    const code = crypto.randomUUID().split("-")[0];
    addRecipe({ ...extracted, code });
    onClose();
  };

  const unsupported = status === "unsupported";

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="max-w-xl flex flex-col max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ScanTextIcon size={16} />
              Scan Recipe
            </DialogTitle>
            <DialogDescription>
              Extract a structured recipe from any website or pasted text using
              an in-browser AI model — no server, no API key.
            </DialogDescription>
          </DialogHeader>

          {/* WebGPU unsupported warning */}
          {unsupported && (
            <div className="flex items-start gap-2 rounded-lg border border-orange-300 bg-orange-50 px-3 py-2.5 text-sm text-orange-800">
              <TriangleAlertIcon size={14} className="shrink-0 mt-0.5" />
              <p>
                WebGPU is required for in-browser AI but is not supported by
                your browser. Please use Chrome 113+ or Edge 113+.
              </p>
            </div>
          )}

          {/* Tab selector */}
          <div className="flex gap-1 rounded-lg bg-muted p-1 self-start">
            <button
              onClick={() => setTab("url")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                tab === "url"
                  ? "bg-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <GlobeIcon size={12} />
              URL
            </button>
            <button
              onClick={() => setTab("text")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                tab === "text"
                  ? "bg-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ClipboardPasteIcon size={12} />
              Paste text
            </button>
          </div>

          {/* Input area */}
          {tab === "url" ? (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com/recipe"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !busy && handleScanUrl()}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  title="Open in new tab"
                  onClick={() => url && window.open(url, "_blank")}
                  disabled={!url}
                >
                  <ExternalLinkIcon size={14} />
                </Button>
              </div>
              {fetchError && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <TriangleAlertIcon size={11} /> {fetchError}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                If the site blocks direct access, the configured CORS proxy will
                be used automatically.
              </p>
            </div>
          ) : (
            <textarea
              className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground resize-none h-36 focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Paste the recipe page text here…"
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
            />
          )}

          {/* LLM status bar */}
          <LLMStatusBar status={status} progress={progress} />
          {errorMessage && (
            <p className="text-xs text-red-600">{errorMessage}</p>
          )}

          {/* Extracted preview */}
          {extracted && (
            <div className="flex-1 overflow-y-auto min-h-0">
              <RecipePreview recipe={extracted} />
            </div>
          )}

          {rawOutput && (
            <p className="text-xs text-muted-foreground border rounded p-2 bg-muted/20">
              {rawOutput}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t flex-wrap">
            {!extracted ? (
              <Button
                className="flex-1"
                disabled={
                  busy ||
                  unsupported ||
                  (tab === "url" ? !url.trim() : !pastedText.trim())
                }
                onClick={tab === "url" ? handleScanUrl : handleScanText}
              >
                {busy ? (
                  <LoaderIcon size={14} className="animate-spin" />
                ) : (
                  <BrainCircuitIcon size={14} />
                )}
                {status === "loading"
                  ? `Loading model… ${progress}%`
                  : status === "extracting"
                  ? "Extracting…"
                  : fetching
                  ? "Fetching page…"
                  : "Extract Recipe"}
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setImportOpen(true)}
                >
                  Edit before importing
                </Button>
                <Button className="flex-1" onClick={handleImportDirect}>
                  <CheckIcon size={14} />
                  Import
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setExtracted(null); setRawOutput(null); }}
                >
                  Retry
                </Button>
              </>
            )}
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit before importing */}
      {extracted && (
        <RecipeFormDialog
          open={importOpen}
          onOpenChange={(v) => !v && setImportOpen(false)}
          recipe={extracted}
        />
      )}
    </>
  );
}
