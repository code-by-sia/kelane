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
import { KejalSVG } from "@/components/chef-assistant/kejal-svg";
import { ChefCharacter } from "@/components/chef-assistant/chef-character";
import { RecipeScanner } from "@/components/recipe-scanner";
import { ChatRecipeCard, ChatAddRecipeButton } from "./chat-blocks";
import "./assistant.css";

// ── App routes Kejal can navigate to ──────────────────────────────────────────
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
  { emoji: "🫕", text: "Suggest a recipe I haven't tried yet" },
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

  return `You are Kejal, a friendly culinary assistant inside Kelane (recipe & meal planner). Warm, enthusiastic, and knowledgeable about cooking from all cuisines. Personality: like a talented home chef who loves sharing good food.

${greeting}

═══ RESPONSE FORMAT — follow this strictly every time ═══

Keep your text reply SHORT: 1–2 sentences maximum (≤ 25 words).
Then ALWAYS add 2–4 choice items at the end using exactly this format:
[CHOICE: Button label here]

Choices should be natural, actionable follow-ups the user might want next.
Examples:
• After suggesting a recipe  → [CHOICE: Show me the ingredients] [CHOICE: How do I make it?] [CHOICE: Suggest something else]
• After a cooking tip        → [CHOICE: Give me another tip] [CHOICE: Show me a recipe using this]
• After navigation/action    → [CHOICE: What else can I do?] [CHOICE: Take me to Groceries]

═══ RICH BLOCKS — embed interactive cards in your response ═══
• [RECIPE:exact recipe name] — shows a full recipe card with ingredients and steps.
  Use this EVERY TIME you mention a specific recipe from the collection.
  The name must match exactly as listed below.
• [NEW_RECIPE] — place at the VERY END when you write out a full recipe with ingredients + steps
  for something NOT in the collection. This shows a "Save Recipe" button.

═══ APP ACTIONS (place at the very end, after choices) ═══
• [NAV:/path] — navigate the user. Routes: ${Object.entries(NAV_ROUTES).map(([p, l]) => `${p}=${l}`).join(", ")}
• [LIKE:exact recipe name] — toggle favourite
• [FLAG:exact recipe name] — toggle want-to-cook
Only use actions when explicitly requested. At most one [NAV:] per response.

═══ RULES ═══
- NEVER write more than 2 sentences of prose.
- Always include [CHOICE:] items — no exceptions.
- Use a food emoji 🍽️ occasionally but keep text tight.
- Never invent recipes not in the collection as if they exist in the app.

User's recipe collection (${recipes.length} total):
${list || "No recipes yet — suggest they scan or add some!"}`;
}

// ── Block parser — extracts all structured tags from a stored message ─────────
// Strips tags from text and returns them as typed collections.
// Also sanitises streaming display (strips block tags so they don't flash mid-stream).
function parseBlocks(content) {
  const choices    = [];
  const recipeRefs = []; // names of known recipes → show ChatRecipeCard
  let   hasNewRecipe = false;

  const text = content
    .replace(/\[CHOICE:\s*([^\]]+)\]/g, (_, c) => { choices.push(c.trim()); return ""; })
    .replace(/\[RECIPE:\s*([^\]]+)\]/g,  (_, n) => { recipeRefs.push(n.trim()); return ""; })
    .replace(/\[NEW_RECIPE\]/g,           ()     => { hasNewRecipe = true; return ""; })
    // Strip remaining app-action tags (NAV/LIKE/FLAG) from visible text
    .replace(/\[(?:NAV|LIKE|FLAG):[^\]]+\]/g, "")
    .trim();

  return { text, choices, recipeRefs, hasNewRecipe };
}

// Clean block tags from streaming text so they don't flash mid-stream
function cleanStreamText(content) {
  return content
    .replace(/\[RECIPE:[^\]]*\]?/g, "")
    .replace(/\[NEW_RECIPE\]?/g, "")
    .replace(/\[(?:NAV|LIKE|FLAG):[^\]]*\]?/g, "")
    .trim();
}

// ── Page component ────────────────────────────────────────────────────────────
export default function AssistantPage() {
  const navigate     = useNavigate();
  const recipes      = useRecipeStore((s) => s.recipes);
  const updateRecipe = useRecipeStore((s) => s.updateRecipe);
  const userName     = useSetupStore((s) => s.profile?.name);

  const [input, setInput]           = useState("");
  const [greetOverride, setGreet]   = useState(false);
  const [scannerText, setScannerText] = useState(null); // null = closed
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

  const handleChoice = (text) => {
    if (isLoading || status === "unsupported") return;
    send(text, systemPrompt);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
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
                <KejalSVG pose="greeting" />
              </div>

              <div className="assistant-welcome__text">
                <h2 className="text-xl font-semibold">Hey! I'm Kejal 👨‍🍳</h2>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Your culinary assistant. Ask me anything about cooking,
                  your recipes, or what to make tonight.
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
                <Message
                  key={i}
                  role={msg.role}
                  content={msg.content}
                  onChoice={handleChoice}
                  onScan={setScannerText}
                  isLast={i === messages.length - 1}
                  isLoading={isLoading}
                />
              ))}
              {streaming && (
                <Message role="assistant" content={streaming} isStreaming />
              )}
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
            placeholder="Ask Kejal anything…"
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

      {/* ── Recipe scanner — opened when user clicks "Save Recipe" ─── */}
      <RecipeScanner
        open={scannerText !== null}
        onClose={() => setScannerText(null)}
        initialText={scannerText ?? ""}
      />

    </SidebarPage>
  );
}

// ── Message component ─────────────────────────────────────────────────────────
function Message({ role, content, isStreaming, onChoice, onScan, isLast, isLoading }) {
  const isAssistant = role === "assistant";

  if (!isAssistant) {
    return (
      <div className="asmsg asmsg--user">
        <div className="asmsg__bubble">{content}</div>
      </div>
    );
  }

  // During streaming, strip block tags so they don't flash as raw text
  if (isStreaming) {
    const displayText = cleanStreamText(content);
    return (
      <div className="asmsg asmsg--assistant">
        <span className="asmsg__avatar" aria-hidden>🧑‍🍳</span>
        <div className="asmsg__col">
          <div className="asmsg__bubble">
            {displayText}
            <span className="chef-cursor" aria-hidden />
          </div>
        </div>
      </div>
    );
  }

  const { text, choices, recipeRefs, hasNewRecipe } = parseBlocks(content);

  return (
    <div className="asmsg asmsg--assistant">
      <span className="asmsg__avatar" aria-hidden>🧑‍🍳</span>
      <div className="asmsg__col">

        {/* Text bubble — only shown if there's text remaining after stripping tags */}
        {text && (
          <div className="asmsg__bubble">{text}</div>
        )}

        {/* Known recipe cards */}
        {recipeRefs.map((name) => (
          <ChatRecipeCard key={name} recipeName={name} />
        ))}

        {/* "Save Recipe" button for new recipes described by the assistant */}
        {hasNewRecipe && (
          <ChatAddRecipeButton messageText={content} onScan={onScan} />
        )}

        {/* Choice chips */}
        {choices.length > 0 && (
          <div className="asmsg__choices">
            {choices.map((c) => (
              <button
                key={c}
                type="button"
                className="asmsg__choice"
                onClick={() => onChoice?.(c)}
                disabled={isLoading}
              >
                {c}
              </button>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

// ── Thinking indicator ────────────────────────────────────────────────────────
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
