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

import { useState } from "react";
import {
  BrainCircuitIcon,
  CheckIcon,
  ClipboardPasteIcon,
  DatabaseIcon,
  ExternalLinkIcon,
  GlobeIcon,
  ImageIcon,
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
import "./recipe-scanner.css";

// ── Structured-data helpers ───────────────────────────────────────────────

/** Parse ISO-8601 duration string (PT1H30M) → total minutes */
function parseIsoDuration(str) {
  if (!str || typeof str !== "string") return null;
  const m = str.match(/P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?/i);
  if (!m) return null;
  const days = parseInt(m[1] || 0);
  const hours = parseInt(m[2] || 0);
  const mins = parseInt(m[3] || 0);
  const total = days * 1440 + hours * 60 + mins;
  return total > 0 ? total : null;
}

/** Try to find the first @type:"Recipe" JSON-LD block in raw HTML */
function extractJsonLdRecipe(html) {
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = re.exec(html)) !== null) {
    try {
      const raw = JSON.parse(match[1].trim());
      // Can be a single object, an array, or wrapped in @graph
      const candidates = Array.isArray(raw)
        ? raw
        : raw["@graph"]
        ? raw["@graph"]
        : [raw];
      for (const item of candidates) {
        const types = Array.isArray(item["@type"]) ? item["@type"] : [item["@type"]];
        if (types.some((t) => typeof t === "string" && t.toLowerCase() === "recipe")) {
          return item;
        }
      }
    } catch {
      // malformed JSON — skip
    }
  }
  return null;
}

/** Flatten HowToStep / HowToSection / string instructions to plain strings */
function flattenInstructions(instructions) {
  if (!instructions) return [];
  const arr = Array.isArray(instructions) ? instructions : [instructions];
  const out = [];
  for (const item of arr) {
    if (typeof item === "string") {
      out.push(item.trim());
    } else if (item["@type"] === "HowToStep" || item["@type"] === "HowToDirection") {
      out.push((item.text || item.name || "").trim());
    } else if (item["@type"] === "HowToSection") {
      out.push(...flattenInstructions(item.itemListElement));
    } else if (item.text) {
      out.push(item.text.trim());
    }
  }
  return out.filter(Boolean);
}

/** Convert a schema.org Recipe JSON-LD object into our recipe schema */
function mapJsonLdToRecipe(ld) {
  // Image: can be string, URL object, or array
  let image = "";
  if (ld.image) {
    const img = Array.isArray(ld.image) ? ld.image[0] : ld.image;
    image = typeof img === "string" ? img : img?.url ?? img?.contentUrl ?? "";
  }

  // Total time (prefer totalTime, fall back to prep+cook sum)
  const explicitTotal = parseIsoDuration(ld.totalTime);
  const summedTotal = (parseIsoDuration(ld.prepTime) ?? 0) + (parseIsoDuration(ld.cookTime) ?? 0);
  const totalTime = explicitTotal ?? (summedTotal > 0 ? summedTotal : null);

  // Servings — may be "4 servings" or just "4"
  const yieldRaw = Array.isArray(ld.recipeYield) ? ld.recipeYield[0] : ld.recipeYield;
  const guests = parseInt(String(yieldRaw ?? "")) || null;

  // Calories — may be "450 calories" or 450
  const calRaw = ld.nutrition?.calories;
  const calories = calRaw ? parseInt(String(calRaw).replace(/\D/g, "")) || null : null;

  // Categories
  const cats = ld.recipeCategory ?? [];
  const categories = (Array.isArray(cats) ? cats : [cats]).filter(Boolean);

  // Ingredients
  const ingredients = (ld.recipeIngredient ?? []).map((s) => String(s).trim()).filter(Boolean);

  // Steps
  const rawSteps = flattenInstructions(ld.recipeInstructions);
  const steps = rawSteps.map((action, i) => ({
    id: String(i + 1),
    action,
    duration: null,
    dependsOn: i > 0 ? [String(i)] : [],
  }));

  // Tools from recipeEquipment or tools
  const toolsRaw = ld.tool ?? ld.recipeEquipment ?? [];
  const tools = (Array.isArray(toolsRaw) ? toolsRaw : [toolsRaw])
    .map((t) => (typeof t === "string" ? t : t?.name ?? "").trim())
    .filter(Boolean);

  return {
    name: String(ld.name ?? "").trim(),
    summary: String(ld.description ?? "").trim(),
    calories,
    guests,
    preperationTime: totalTime,
    image,
    categories,
    ingredients,
    steps,
    tools,
  };
}

/** Extract og:image or twitter:image URL from raw HTML */
function extractMetaImage(html) {
  const patterns = [
    /property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1] && m[1].startsWith("http")) return m[1];
  }
  return null;
}

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
function RecipePreview({ recipe, source }) {
  return (
    <div className="border rounded-lg overflow-hidden bg-card flex flex-col gap-0">
      {/* Hero image */}
      {recipe.image ? (
        <img
          src={recipe.image}
          alt={recipe.name}
          className="w-full h-36 object-cover"
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
      ) : (
        <div className="w-full h-20 bg-muted/40 flex items-center justify-center gap-2 text-muted-foreground">
          <ImageIcon size={18} />
          <span className="text-xs">No image found</span>
        </div>
      )}

      <div className="p-4 flex flex-col gap-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-base leading-snug">
              {recipe.name || "Untitled Recipe"}
            </p>
            {source === "json-ld" && (
              <span className="shrink-0 flex items-center gap-1 text-[10px] text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                <DatabaseIcon size={9} />
                Structured data
              </span>
            )}
          </div>
          {recipe.summary && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
              {recipe.summary}
            </p>
          )}
        </div>

        {/* Meta pills */}
        <div className="flex flex-wrap gap-2">
          {recipe.calories > 0 && (
            <span className="text-xs bg-muted/60 rounded-full px-2.5 py-0.5">
              🔥 {recipe.calories} kcal
            </span>
          )}
          {recipe.guests > 0 && (
            <span className="text-xs bg-muted/60 rounded-full px-2.5 py-0.5">
              👥 {recipe.guests} serv.
            </span>
          )}
          {recipe.preperationTime > 0 && (
            <span className="text-xs bg-muted/60 rounded-full px-2.5 py-0.5">
              ⏱ {recipe.preperationTime} min
            </span>
          )}
          {recipe.ingredients?.length > 0 && (
            <span className="text-xs bg-muted/60 rounded-full px-2.5 py-0.5">
              🧂 {recipe.ingredients.length} ingredients
            </span>
          )}
          {recipe.steps?.length > 0 && (
            <span className="text-xs bg-muted/60 rounded-full px-2.5 py-0.5">
              📋 {recipe.steps.length} steps
            </span>
          )}
        </div>

        {/* Ingredient list (first 6) */}
        {recipe.ingredients?.length > 0 && (
          <div>
            <p className="text-xs font-semibold mb-1.5 text-muted-foreground uppercase tracking-wide">
              Ingredients
            </p>
            <ul className="text-xs text-muted-foreground flex flex-col gap-0.5">
              {recipe.ingredients.slice(0, 6).map((ing, i) => (
                <li key={i} className="flex gap-1.5">
                  <span className="text-primary/60 shrink-0">·</span>
                  {ing}
                </li>
              ))}
              {recipe.ingredients.length > 6 && (
                <li className="italic text-muted-foreground/60 mt-0.5">
                  + {recipe.ingredients.length - 6} more
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Steps (first 3) */}
        {recipe.steps?.length > 0 && (
          <div>
            <p className="text-xs font-semibold mb-1.5 text-muted-foreground uppercase tracking-wide">
              Steps
            </p>
            <ol className="text-xs text-muted-foreground flex flex-col gap-1">
              {recipe.steps.slice(0, 3).map((step, i) => (
                <li key={step.id} className="flex gap-2">
                  <span className="shrink-0 font-semibold text-primary/70 w-4">{i + 1}.</span>
                  <span className="line-clamp-1">{step.action}</span>
                  {step.duration && (
                    <span className="shrink-0 text-muted-foreground/60">{step.duration}m</span>
                  )}
                </li>
              ))}
              {recipe.steps.length > 3 && (
                <li className="italic text-muted-foreground/60 mt-0.5 pl-6">
                  + {recipe.steps.length - 3} more steps
                </li>
              )}
            </ol>
          </div>
        )}
      </div>
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
  const [extractedSource, setExtractedSource] = useState(null); // "json-ld" | "llm"
  const [scanError, setScanError] = useState(null);
  const [importOpen, setImportOpen] = useState(false);

  const { extract, status, progress, errorMessage } = useWebLLM();
  const addRecipe = useRecipeStore((s) => s.addRecipe);
  const settingsState = useSettingsStore();
  const proxyPrefix = getProxyPrefix(settingsState);

  const busy = status === "loading" || status === "extracting" || fetching;

  /**
   * Fetch raw HTML from a URL, trying direct then CORS proxy.
   * Returns the raw HTML string or null on failure.
   */
  const fetchHtml = async (targetUrl) => {
    setFetching(true);
    setFetchError(null);
    try {
      let html = null;
      try {
        const res = await fetch(targetUrl, { signal: AbortSignal.timeout(8000) });
        html = await res.text();
      } catch {
        const proxied = `${proxyPrefix}${encodeURIComponent(targetUrl)}`;
        const res = await fetch(proxied, { signal: AbortSignal.timeout(12000) });
        if (!res.ok) throw new Error(`Proxy returned HTTP ${res.status}`);
        html = await res.text();
      }
      setFetching(false);
      return html;
    } catch (err) {
      setFetchError(err?.message ?? "Could not fetch the page");
      setFetching(false);
      return null;
    }
  };

  /** Strip HTML to plain text for LLM fallback */
  const htmlToText = (html) =>
    html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim();

  /** Run the LLM extractor and merge in a discovered image URL */
  const runLlm = async (text, imageUrl = "") => {
    setScanError(null);
    setExtracted(null);
    try {
      const result = await extract(text);
      // If the page had an og:image but the LLM left image blank, fill it in
      if (!result.image && imageUrl) result.image = imageUrl;
      setExtracted(result);
      setExtractedSource("llm");
    } catch {
      setScanError("Extraction failed — the model couldn't parse a recipe from this text. Try pasting just the ingredients and steps.");
    }
  };

  const handleScanUrl = async () => {
    const html = await fetchHtml(url);
    if (!html) return;

    // 1. Try JSON-LD structured data — fastest, no LLM needed
    const ld = extractJsonLdRecipe(html);
    if (ld) {
      const recipe = mapJsonLdToRecipe(ld);
      // Fallback to og:image if JSON-LD had no image
      if (!recipe.image) recipe.image = extractMetaImage(html) ?? "";
      setExtracted(recipe);
      setExtractedSource("json-ld");
      return;
    }

    // 2. No structured data — extract og:image then run LLM on plain text
    const imageUrl = extractMetaImage(html) ?? "";
    await runLlm(htmlToText(html), imageUrl);
  };

  const handleScanText = async () => {
    if (!pastedText.trim()) return;
    await runLlm(pastedText);
  };

  const handleImportDirect = () => {
    if (!extracted) return;
    const code = crypto.randomUUID().split("-")[0];
    addRecipe({ ...extracted, code });
    onClose();
  };

  const reset = () => {
    setExtracted(null);
    setExtractedSource(null);
    setScanError(null);
  };

  const unsupported = status === "unsupported";

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="max-w-xl flex flex-col max-h-[90vh] bg-card">
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
          <div className="scanner-tabs">
            <button onClick={() => setTab("url")} className={`scanner-tab ${tab === "url" ? "scanner-tab--active" : "scanner-tab--idle"}`}>
              <GlobeIcon size={12} /> URL
            </button>
            <button onClick={() => setTab("text")} className={`scanner-tab ${tab === "text" ? "scanner-tab--active" : "scanner-tab--idle"}`}>
              <ClipboardPasteIcon size={12} /> Paste text
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
              className="scanner-textarea"
              placeholder="Paste the recipe page text here…"
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
            />
          )}

          {/* LLM status bar — only shown when model is actually involved */}
          {extractedSource !== "json-ld" && (
            <LLMStatusBar status={status} progress={progress} />
          )}
          {errorMessage && extractedSource !== "json-ld" && (
            <p className="text-xs text-red-600">{errorMessage}</p>
          )}
          {scanError && (
            <p className="text-xs text-red-600 flex items-start gap-1.5">
              <TriangleAlertIcon size={12} className="shrink-0 mt-0.5" />
              {scanError}
            </p>
          )}

          {/* Extracted preview */}
          {extracted && (
            <div className="flex-1 overflow-y-auto min-h-0">
              <RecipePreview recipe={extracted} source={extractedSource} />
            </div>
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
                <Button variant="ghost" size="sm" onClick={reset}>
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
