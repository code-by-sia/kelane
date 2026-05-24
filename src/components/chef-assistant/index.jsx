"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import useRecipeStore from "@/store/recipe";
import useSetupStore from "@/store/setup";
import { useChefLLM } from "./use-chef-llm";
import { useDraggable } from "./use-draggable";
import { ChefCharacter } from "./chef-character";
import { ChatPanel } from "./chat-panel";
import "./chef-assistant.css";

const PANEL_H  = 442; // chat panel height (430) + gap (12)
const PANEL_W  = 320; // chat panel width
const CHAR_W   = 110; // character button width

// ── Available app routes Hejar can navigate to ────────────────────────────────
const NAV_ROUTES = {
  "/":            "Explore (home)",
  "/my-recipes":  "My Recipes",
  "/categories":  "Categories",
  "/favorites":   "Favourites",
  "/want-to-cook":"Want to Cook",
  "/most-recent": "Most Recent",
  "/groceries":   "Groceries",
  "/calendar":    "Calendar",
  "/history":     "Cook History",
  "/feeds":       "Discover / Feeds",
  "/browser":     "Recipe Browser",
};

// ── System prompt — injected with recipe library + user name + app actions ────
function buildSystemPrompt(recipes, userName) {
  const greeting = userName ? `The user's name is ${userName}.` : "";
  const list = recipes
    .slice(0, 60)
    .map((r) => `• ${r.name}${r.categories?.length ? ` [${r.categories.join(", ")}]` : ""}`)
    .join("\n");

  const routeList = Object.entries(NAV_ROUTES)
    .map(([path, label]) => `  ${path} — ${label}`)
    .join("\n");

  return `You are Hejar, a warm and knowledgeable Kurdish culinary assistant living inside Kelane, a recipe & meal planner app. You are Kurdish and proud of it — your personality reflects Kurdish hospitality and warmth. You may occasionally use Kurdish (Kurmanji) words or phrases naturally (e.g. Silav!, Supas!, Xweş bê!, Baş e!, Dê çêbibe!), but NEVER use words or expressions from Arabic (e.g. no Shukran, Yalla, Habibi), Turkish, Persian/Farsi, Italian, or any other language. Kurdish only.

${greeting}

You help with:
- Suggesting recipes from the user's own collection
- Cooking tips, techniques, timing, and temperatures
- Ingredient substitutions when something is missing
- Meal planning — what to cook tonight, weekly plans
- Kurdish and Middle Eastern cuisine knowledge
- Food science, nutrition, and general kitchen questions
- Navigating the app and managing the user's recipe data

APP ACTIONS — you can control the app by placing tags at the END of your response:
• Navigate: [NAV:/path] — takes the user to a page. Available routes:
${routeList}
• Favourite a recipe: [LIKE:exact recipe name] — toggles the recipe's favourite
• Mark want-to-cook: [FLAG:exact recipe name] — toggles the recipe's "want to cook" flag

Action rules:
- Only use actions when the user explicitly asks (e.g. "take me to groceries", "add X to favourites")
- Put action tags at the very end of your response, after all text
- Include at most one [NAV:] tag per response
- Use the exact recipe name from the collection for [LIKE:] and [FLAG:]
- Always confirm the action in your text before the tag (e.g. "Taking you to Groceries!" then [NAV:/groceries])

General rules:
- Keep answers concise: 2–4 sentences unless a detailed step-by-step is needed.
- Refer to specific recipes from the user's collection whenever relevant.
- Use a food emoji now and then 🍽️
- Never make up recipes not in the list as if they exist in the app.
- Be enthusiastic and warm in a Kurdish way — never use Arabic, Turkish, Persian, Italian, or any non-Kurdish expressions.

User's recipe collection (${recipes.length} recipe${recipes.length !== 1 ? "s" : ""}):
${list || "No recipes added yet — encourage them to scan or add some!"}`;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function ChefAssistant() {
  const [isOpen, setIsOpen]       = useState(false);
  const [greetOverride, setGreet] = useState(false);

  const location    = useLocation();
  const navigate    = useNavigate();
  const isExplore   = location.pathname === "/";

  const recipes      = useRecipeStore((s) => s.recipes);
  const updateRecipe = useRecipeStore((s) => s.updateRecipe);
  const userName     = useSetupStore((s) => s.profile?.name);

  const { messages, streaming, send, status, progress, clear, pendingActions, clearActions } =
    useChefLLM();

  const { pos, isDragging, dragHandlers } = useDraggable();

  // Determine whether the panel opens above or below the character, and
  // whether it extends left or right, based on current screen position.
  const panelDir  = pos.y < PANEL_H                                    ? "below" : "above";
  const panelSide = pos.x + CHAR_W / 2 < (window.innerWidth ?? 800) / 2 ? "right" : "left";

  const systemPrompt = useMemo(
    () => buildSystemPrompt(recipes, userName),
    [recipes, userName],
  );

  // ── Auto-close panel when user leaves the Explore page ────────────────────
  useEffect(() => {
    if (!isExplore && isOpen) setIsOpen(false);
  }, [isExplore, isOpen]);

  // ── Execute actions returned by the LLM ───────────────────────────────────
  useEffect(() => {
    if (!pendingActions.length) return;

    for (const action of pendingActions) {
      switch (action.type) {
        case "navigate":
          // Only navigate to known safe internal routes
          if (action.payload in NAV_ROUTES) {
            setIsOpen(false);
            navigate(action.payload);
          }
          break;

        case "like": {
          const match = recipes.find((r) =>
            r.name.toLowerCase().includes(action.payload.toLowerCase()),
          );
          if (match) updateRecipe(match.code, { liked: !match.liked });
          break;
        }

        case "flag": {
          const match = recipes.find((r) =>
            r.name.toLowerCase().includes(action.payload.toLowerCase()),
          );
          if (match) updateRecipe(match.code, { flagged: !match.flagged });
          break;
        }

        default:
          break;
      }
    }

    clearActions();
  }, [pendingActions, clearActions, navigate, recipes, updateRecipe]);

  // ── Greeting pose when panel opens ────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setGreet(true);
      const t = setTimeout(() => setGreet(false), 1200);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // ── Mood mapping ──────────────────────────────────────────────────────────
  const llmMood =
    status === "loading" || status === "thinking"
      ? "thinking"
      : streaming
        ? "talking"
        : "idle";

  const mood = greetOverride ? "greeting" : llmMood;

  const handleSend = (text) => send(text, systemPrompt);

  // Only render on the Explore page; panel state preserved across navigation
  if (!isExplore) return null;

  return (
    <div
      className="chef-assistant"
      data-dir={panelDir}
      data-side={panelSide}
      style={{ top: pos.y, left: pos.x }}
    >
      {isOpen && (
        <ChatPanel
          messages={messages}
          streaming={streaming}
          status={status}
          progress={progress}
          onSend={handleSend}
          onClose={() => setIsOpen(false)}
          onClear={clear}
        />
      )}
      <ChefCharacter
        mood={mood}
        onClick={() => setIsOpen((o) => !o)}
        isOpen={isOpen}
        hasMessages={messages.length > 0}
        dragHandlers={dragHandlers}
        isDragging={isDragging}
      />
    </div>
  );
}
