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
import { useNavigate } from "react-router";
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
import { toast } from "sonner";
import { useWebLLM } from "@/hooks/use-web-llm";
import useRecipeStore from "@/store/recipe";
import { getProxyPrefix } from "@/store/settings";
import useSettingsStore from "@/store/settings";
import { LLMStatusBar } from "./llm-status-bar";
import { RecipePreview } from "./recipe-preview";
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
  const servings = parseInt(String(yieldRaw ?? "")) || null;

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
    servings,
    prepTime: totalTime,
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

  const go = useNavigate();
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
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>|<\/li>|<\/div>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/[ \t]{2,}/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

  /**
   * Paste handler for the rich-text tab.
   * If the clipboard contains text/html, we try JSON-LD first (no LLM needed),
   * then fall back to stripping the HTML to clean plain text for the textarea.
   */
  const handleRichPaste = (e) => {
    const html = e.clipboardData?.getData("text/html");
    if (!html) return; // no HTML in clipboard — let the default plain-text paste work

    // 1. JSON-LD in copied HTML? Extract instantly, no LLM.
    const ld = extractJsonLdRecipe(html);
    if (ld) {
      e.preventDefault();
      const recipe = mapJsonLdToRecipe(ld);
      if (!recipe.image) recipe.image = extractMetaImage(html) ?? "";
      setExtracted(recipe);
      setExtractedSource("json-ld");
      return;
    }

    // 2. No structured data — strip tags and populate the textarea with clean text
    e.preventDefault();
    const text = htmlToText(html);
    setPastedText(text);
  };

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
    addRecipe({ ...extracted, code, date: new Date().toISOString() });
    onClose();
    toast.success(`"${extracted.name || "Recipe"}" imported`, {
      action: { label: "View", onClick: () => go(`/my-recipes/${code}`) },
    });
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
              placeholder="Paste the recipe page text or copy a whole recipe page here…"
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              onPaste={handleRichPaste}
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
