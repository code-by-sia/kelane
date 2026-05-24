"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { SendIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SidebarPage from "@/pages/sidebar-page";
import useRecipeStore from "@/store/recipe";
import useSetupStore from "@/store/setup";
import { useChefLLM } from "@/components/chef-assistant/use-chef-llm";
import { HEjarSVG } from "@/components/chef-assistant/hejar-svg";
import { ChefCharacter } from "@/components/chef-assistant/chef-character";
import "./assistant.css";

// ── App routes Hejar can navigate to ─────────────────────────────────────────
const NAV_ROUTES = {
  "/":             "Explore",
  "/my-recipes":   "My Recipes",
  "/categories":   "Categories",
  "/favorites":    "Favourites",
  "/want-to-cook": "Want to Cook",
  "/most-recent":  "Most Recent",
  "/groceries":    "Groceries",
  "/calendar":     "Calendar",
  "/history":      "Cook History",
  "/feeds":        "Discover",
  "/browser":      "Recipe Browser",
};

// ── Suggestion chips shown in the welcome state ───────────────────────────────
const SUGGESTIONS = [
  { emoji: "🌙", text: "What should I cook tonight?" },
  { emoji: "🧊", text: "What can I make with what's in my fridge?" },
  { emoji: "📅", text: "Plan my meals for this week" },
  { emoji: "🫕", text: "Suggest a Kurdish recipe I haven't tried" },
  { emoji: "⏱️", text: "Quick meals under 30 minutes" },
  { emoji: "🥗", text: "Something healthy for lunch" },
  { emoji: "⚠️", text: "Help me use expiring ingredients" },
  { emoji: "🍽️", text: "What did I cook recently?" },
];

// ── System prompt ─────────────────────────────────────────────────────────────
function buildSystemPrompt(recipes, userName) {
  const greeting  = userName ? `The user's name is ${userName}.` : "";
  const list      = recipes
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

APP ACTIONS — place tags at the END of your response to control the app:
• Navigate: [NAV:/path] — takes the user to a page. Available routes:
${routeList}
• Favourite a recipe: [LIKE:exact recipe name]
• Mark want-to-cook:  [FLAG:exact recipe name]

Action rules:
- Only use actions when the user explicitly asks (e.g. "take me to groceries", "add X to favourites")
- Put tags at the very end, after all text. At most one [NAV:] per response.
- Use the exact recipe name from the collection for [LIKE:] and [FLAG:]
- Confirm the action in your text before the tag

General rules:
- Keep answers concise: 2–4 sentences unless a step-by-step is needed.
- Refer to recipes from the user's collection whenever relevant.
- Use a food emoji now and then 🍽️
- Never make up recipes not in the list as if they exist in the app.
- Be enthusiastic and warm in a Kurdish way — never Italian, Arabic, Turkish, or Persian expressions.

User's recipe collection (${recipes.length} recipe${recipes.length !== 1 ? "s" : ""}):
${list || "No recipes added yet — encourage them to scan or add some!"}`;
}

// ── Page component ────────────────────────────────────────────────────────────
export default function AssistantPage() {
  const navigate     = useNavigate();
  const recipes      = useRecipeStore((s) => s.recipes);
  const updateRecipe = useRecipeStore((s) => s.updateRecipe);
  const userName     = useSetupStore((s) => s.profile?.name);

  const [input, setInput]         = useState("");
  const [greetOverride, setGreet] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  const { messages, streaming, send, status, progress, clear, pendingActions, clearActions } =
    useChefLLM();

  const systemPrompt = useMemo(() => buildSystemPrompt(recipes, userName), [recipes, userName]);

  const isLoading = status === "loading" || status === "thinking";
  const isEmpty   = messages.length === 0 && !streaming;

  // ── Character mood ───────────────────────────────────────────────────────
  const llmMood =
    status === "loading" || status === "thinking" ? "thinking"
    : streaming                                   ? "talking"
    : "idle";
  const mood = greetOverride ? "greeting" : llmMood;

  // ── Auto-scroll ──────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  // ── Focus input & greeting pose on mount ─────────────────────────────────
  useEffect(() => {
    inputRef.current?.focus();
    setGreet(true);
    const t = setTimeout(() => setGreet(false), 1400);
    return () => clearTimeout(t);
  }, []);

  // ── Execute LLM actions ──────────────────────────────────────────────────
  useEffect(() => {
    if (!pendingActions.length) return;
    for (const action of pendingActions) {
      switch (action.type) {
        case "navigate":
          if (action.payload in NAV_ROUTES) navigate(action.payload);
          break;
        case "like": {
          const m = recipes.find((r) => r.name.toLowerCase().includes(action.payload.toLowerCase()));
          if (m) updateRecipe(m.code, { liked: !m.liked });
          break;
        }
        case "flag": {
          const m = recipes.find((r) => r.name.toLowerCase().includes(action.payload.toLowerCase()));
          if (m) updateRecipe(m.code, { flagged: !m.flagged });
          break;
        }
      }
    }
    clearActions();
  }, [pendingActions, clearActions, navigate, recipes, updateRecipe]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    send(text, systemPrompt);
  };

  const handleSuggestion = (text) => {
    if (isLoading || status === "unsupported") return;
    send(text, systemPrompt);
  };

  // ── Header action (clear) ─────────────────────────────────────────────────
  const headerAction = messages.length > 0 ? (
    <Button variant="ghost" size="sm" onClick={clear} className="gap-1.5 text-muted-foreground">
      <Trash2Icon size={13} />
      Clear chat
    </Button>
  ) : null;

  return (
    <SidebarPage title="Cooking Assistant" header={headerAction}>
      <div className="assistant-layout">

        {/* ── Messages / welcome ──────────────────────────────────────────── */}
        <div className="assistant-messages">
          {isEmpty ? (
            /* Welcome state */
            <div className="assistant-welcome">
              <div className="assistant-welcome__avatar">
                <HEjarSVG pose="greeting" />
              </div>

              <div className="assistant-welcome__text">
                <h2 className="text-xl font-semibold">Silav! I'm Hejar 👋</h2>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Your Kurdish culinary assistant. Ask me anything about cooking,
                  your recipes, or meal planning.
                </p>
              </div>

              <div className="assistant-suggestions">
                {SUGGESTIONS.map(({ emoji, text }) => (
                  <button
                    key={text}
                    type="button"
                    className="assistant-chip"
                    onClick={() => handleSuggestion(text)}
                    disabled={isLoading || status === "unsupported"}
                  >
                    <span className="assistant-chip__emoji">{emoji}</span>
                    <span>{text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Conversation thread */
            <div className="assistant-thread">
              {messages.map((msg, i) => (
                <Message key={i} role={msg.role} content={msg.content} />
              ))}
              {streaming && <Message role="assistant" content={streaming} isStreaming />}
              {status === "thinking" && !streaming && <ThinkingDots />}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* ── Model loading progress ────────────────────────────────────── */}
        {status === "loading" && (
          <div className="assistant-status-bar">
            <div className="assistant-progress">
              <div className="assistant-progress__fill" style={{ width: `${progress}%` }} />
            </div>
            <p className="assistant-status-label">Loading model… {progress}%</p>
          </div>
        )}

        {/* ── WebGPU not available ──────────────────────────────────────── */}
        {status === "unsupported" && (
          <div className="assistant-status-bar">
            <p className="assistant-status-label text-amber-600">
              ⚠️ WebGPU not supported. Try Chrome 113+ or Edge 113+.
            </p>
          </div>
        )}

        {/* ── Input row ────────────────────────────────────────────────── */}
        <form className="assistant-input-row" onSubmit={handleSubmit}>
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Hejar anything…"
            disabled={isLoading || status === "unsupported"}
            className="flex-1 h-9 text-sm"
          />
          <Button
            type="submit"
            size="icon"
            className="h-9 w-9 shrink-0"
            disabled={!input.trim() || isLoading || status === "unsupported"}
          >
            <SendIcon size={14} />
          </Button>
        </form>

      </div>
      {/* ── Corner character ─────────────────────────────────────────── */}
      <div className="assistant-actor">
        <ChefCharacter
          mood={mood}
          onClick={() => inputRef.current?.focus()}
          isOpen={false}
          hasMessages={false}
        />
      </div>

    </SidebarPage>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function Message({ role, content, isStreaming }) {
  const isAssistant = role === "assistant";
  return (
    <div className={`asmsg ${isAssistant ? "asmsg--assistant" : "asmsg--user"}`}>
      {isAssistant && <span className="asmsg__avatar" aria-hidden>🧑‍🍳</span>}
      <div className="asmsg__bubble">
        {content}
        {isStreaming && <span className="chef-cursor" aria-hidden />}
      </div>
    </div>
  );
}

function ThinkingDots() {
  return (
    <div className="asmsg asmsg--assistant">
      <span className="asmsg__avatar" aria-hidden>🧑‍🍳</span>
      <div className="asmsg__bubble chef-thinking-bubble">
        <span /><span /><span />
      </div>
    </div>
  );
}
