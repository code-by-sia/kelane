/**
 * Kelane Recipe Importer — popup script
 *
 * Flow:
 *  1. Get the active tab.
 *  2. Inject extractRecipeFromPage() into the page via chrome.scripting.executeScript.
 *  3. Render the recipe preview (or a "not found" state).
 *  4. On "Import", ask the background service worker to open the Kelane import page.
 */

"use strict";

/* ── DOM references ──────────────────────────────────────────────────────── */
const $ = (id) => document.getElementById(id);

const stateLoading  = $("stateLoading");
const stateNone     = $("stateNone");
const stateError    = $("stateError");
const stateRecipe   = $("stateRecipe");
const settingsPanel = $("settingsPanel");
const settingsToggle = $("settingsToggle");

/* ── Show/hide states ────────────────────────────────────────────────────── */
function showState(name) {
  stateLoading.hidden = name !== "loading";
  stateNone.hidden    = name !== "none";
  stateError.hidden   = name !== "error";
  stateRecipe.hidden  = name !== "recipe";
}

/* ── Recipe extraction — injected into the page ──────────────────────────── */
/**
 * This function runs inside the inspected page, not in the extension context.
 * It must be completely self-contained (no closures over popup variables).
 */
function extractRecipeFromPage() {
  // Parse ISO 8601 duration → minutes (e.g. "PT1H30M" → 90)
  function parseDuration(iso) {
    if (!iso || typeof iso !== "string") return 0;
    const m = iso.match(/P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?/i);
    if (!m) return 0;
    return (parseInt(m[1] || 0) * 24 * 60) +
           (parseInt(m[2] || 0) * 60) +
            parseInt(m[3] || 0);
  }

  // Extract first image URL from schema.org image field (string | array | object)
  function extractImage(img) {
    if (!img) return "";
    if (typeof img === "string") return img;
    if (Array.isArray(img)) return extractImage(img[0]);
    return img.url || img.thumbnail || "";
  }

  // Flatten schema.org HowToStep / HowToSection / string[] into plain text array
  function flattenSteps(items) {
    const out = [];
    for (const item of Array.isArray(items) ? items : [items]) {
      if (typeof item === "string") {
        out.push(item.trim());
      } else if (item["@type"] === "HowToStep") {
        out.push((item.text || item.name || "").trim());
      } else if (item["@type"] === "HowToSection") {
        out.push(...flattenSteps(item.itemListElement || []));
      } else if (item.text || item.name) {
        out.push((item.text || item.name || "").trim());
      }
    }
    return out.filter(Boolean);
  }

  // Convert schema.org instructions to Kelane step objects
  function parseInstructions(raw) {
    if (!raw) return [];
    const texts = typeof raw === "string"
      ? raw.split(/\n+/).map((s) => s.trim()).filter(Boolean)
      : flattenSteps(raw);
    return texts.map((action, i) => ({
      id: i + 1,
      action,
      duration: 0,
      ingredients: [],
      tools: [],
      dependsOn: i === 0 ? [] : [i],
    }));
  }

  // Map a schema.org Recipe object to Kelane's recipe shape
  function fromSchema(s) {
    const image    = extractImage(s.image);
    const prepTime = parseDuration(s.totalTime || s.cookTime || s.prepTime);
    const yieldStr = Array.isArray(s.recipeYield) ? s.recipeYield[0] : (s.recipeYield || "4");
    const servings = parseInt(String(yieldStr).match(/\d+/)?.[0] || "4");
    const calories = parseInt(String(s.nutrition?.calories || "0").match(/\d+/)?.[0] || "0");
    const rawKw    = s.keywords || [];
    const tags     = typeof rawKw === "string"
      ? rawKw.split(",").map((t) => t.trim()).filter(Boolean)
      : Array.isArray(rawKw) ? rawKw : [];

    return {
      name:        (s.name || document.title || "Imported Recipe").trim(),
      summary:     (s.description || "").trim(),
      image,
      images:      image ? [image] : [],
      prepTime,
      servings,
      calories,
      ingredients: (s.recipeIngredient || []).map((i) => String(i).trim()),
      steps:       parseInstructions(s.recipeInstructions),
      tags,
      source:      window.location.href,
    };
  }

  // ── 1. JSON-LD (most reliable — used by AllRecipes, BBC, NYT, etc.) ──────
  for (const el of document.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      const data = JSON.parse(el.textContent);
      const list = data["@graph"]
        ? data["@graph"]
        : Array.isArray(data) ? data : [data];

      for (const item of list) {
        const type = item["@type"];
        if (type === "Recipe" || (Array.isArray(type) && type.includes("Recipe"))) {
          return fromSchema(item);
        }
      }
    } catch { /* malformed JSON-LD — keep trying */ }
  }

  // ── 2. Microdata (schema.org/Recipe itemtype) ─────────────────────────────
  const microdataEl = document.querySelector(
    '[itemtype="https://schema.org/Recipe"],[itemtype="http://schema.org/Recipe"]'
  );
  if (microdataEl) {
    const getProp = (prop) => {
      const e = microdataEl.querySelector(`[itemprop="${prop}"]`);
      return e
        ? (e.getAttribute("content") || e.getAttribute("datetime") || e.textContent.trim())
        : null;
    };
    const getAllProp = (prop) =>
      [...microdataEl.querySelectorAll(`[itemprop="${prop}"]`)]
        .map((e) => e.getAttribute("content") || e.textContent.trim())
        .filter(Boolean);

    const image = getProp("image") || "";
    return {
      name:        (getProp("name") || document.title || "Imported Recipe").trim(),
      summary:     (getProp("description") || "").trim(),
      image,
      images:      image ? [image] : [],
      prepTime:    parseDuration(getProp("totalTime") || getProp("cookTime") || ""),
      servings:    parseInt(String(getProp("recipeYield") || "4").match(/\d+/)?.[0] || "4"),
      calories:    parseInt(String(getProp("calories") || "0").match(/\d+/)?.[0] || "0"),
      ingredients: getAllProp("recipeIngredient"),
      steps:       getAllProp("recipeInstructions").map((action, i) => ({
        id: i + 1, action, duration: 0, ingredients: [], tools: [],
        dependsOn: i === 0 ? [] : [i],
      })),
      tags:   [],
      source: window.location.href,
    };
  }

  return null; // no structured recipe data found
}

/* ── Render helpers ──────────────────────────────────────────────────────── */
function metaChip(icon, label) {
  const span = document.createElement("span");
  span.className = "meta-chip";
  span.innerHTML = `${icon} ${label}`;
  return span;
}

function renderRecipe(recipe) {
  // Hero image
  const hero = $("recipeHero");
  if (recipe.image) {
    const img = document.createElement("img");
    img.src = recipe.image;
    img.alt = recipe.name;
    img.onerror = () => img.remove(); // fall back to placeholder
    hero.appendChild(img);
  }

  // Name
  $("recipeName").textContent = recipe.name;

  // Source URL
  try {
    const host = new URL(recipe.source).hostname.replace(/^www\./, "");
    $("recipeSourceText").textContent = host;
  } catch {
    $("recipeSource").hidden = true;
  }

  // Meta chips
  const meta = $("recipeMeta");
  if (recipe.prepTime > 0) {
    const h = Math.floor(recipe.prepTime / 60);
    const m = recipe.prepTime % 60;
    const label = h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m} min`;
    meta.appendChild(metaChip("⏱", label));
  }
  if (recipe.servings > 0)
    meta.appendChild(metaChip("🍽", `${recipe.servings} servings`));
  if (recipe.ingredients.length > 0)
    meta.appendChild(metaChip("🧂", `${recipe.ingredients.length} ingredients`));
  if (recipe.steps.length > 0)
    meta.appendChild(metaChip("📋", `${recipe.steps.length} steps`));
  if (recipe.calories > 0)
    meta.appendChild(metaChip("🔥", `${recipe.calories} kcal`));

  showState("recipe");
}

/* ── Encoding ────────────────────────────────────────────────────────────── */
/**
 * Encode an arbitrary string as URL-safe base64 (base64url, no padding).
 * Uses TextEncoder so non-ASCII characters (accented names, emoji) survive.
 */
function toBase64Url(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/* ── Import ──────────────────────────────────────────────────────────────── */
async function handleImport(recipe) {
  const btn = $("importBtn");
  btn.disabled = true;
  btn.textContent = "Opening Kelane…";

  const { kelaneUrl = "https://chef.samalstudios.com" } = await chrome.storage.sync.get("kelaneUrl");
  const clean = kelaneUrl.replace(/\/$/, "");

  // Encode as base64url payload — handles long recipes and non-ASCII safely
  const payload = toBase64Url(JSON.stringify(recipe));
  const importUrl = `${clean}/import?r=${payload}`;

  chrome.runtime.sendMessage({ type: "OPEN_TAB", url: importUrl });
  window.close();
}

/* ── Settings ────────────────────────────────────────────────────────────── */
settingsToggle.addEventListener("click", () => {
  settingsPanel.hidden = !settingsPanel.hidden;
});

async function loadSettings() {
  const { kelaneUrl = "https://chef.samalstudios.com" } = await chrome.storage.sync.get("kelaneUrl");
  $("kelaneUrl").value = kelaneUrl;
}

$("saveSettings").addEventListener("click", async () => {
  const url = $("kelaneUrl").value.trim() || "http://localhost:5173";
  await chrome.storage.sync.set({ kelaneUrl: url });
  const toast = $("savedToast");
  toast.hidden = false;
  setTimeout(() => { toast.hidden = true; }, 2000);
});

/* ── Boot ────────────────────────────────────────────────────────────────── */
async function main() {
  showState("loading");
  await loadSettings();

  // Get the current tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Chrome restricts scripting on chrome:// and chrome-extension:// pages
  if (!tab?.url || tab.url.startsWith("chrome")) {
    showState("error");
    return;
  }

  let recipe = null;
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractRecipeFromPage,
    });
    recipe = result?.result ?? null;
  } catch {
    showState("error");
    return;
  }

  if (!recipe || !recipe.name) {
    showState("none");
    return;
  }

  renderRecipe(recipe);

  $("importBtn").addEventListener("click", () => handleImport(recipe));
}

main();
