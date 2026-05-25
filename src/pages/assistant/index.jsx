"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { HistoryIcon, PlusIcon, SendIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import SidebarPage from "@/pages/sidebar-page";
import useRecipeStore from "@/store/recipe";
import useSetupStore from "@/store/setup";
import useAssistantStore from "@/store/assistant";
import { useChefLLM } from "@/components/chef-assistant/use-chef-llm";
import { KejalSVG } from "@/components/chef-assistant/kejal-svg";
import { ChefCharacter } from "@/components/chef-assistant/chef-character";
import { RecipeScanner } from "@/components/recipe-scanner";
import { ChatRecipeCard, ChatAddRecipeButton } from "./chat-blocks";
import "./assistant.css";

// ── App routes Kejal can navigate to ──────────────────────────────────────────
const NAV_ROUTES = {
  "/": "Explore",
  "/my-recipes": "My Recipes",
  "/categories": "Categories",
  "/favorites": "Favourites",
  "/want-to-cook": "Want to Cook",
  "/most-recent": "Most Recent",
  "/groceries": "Groceries",
  "/calendar": "Calendar",
  "/history": "Cook History",
  "/feeds": "Discover",
  "/browser": "Recipe Browser",
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
  const greeting = userName ? `The user's name is ${userName}.` : "";
  const list = recipes
    .slice(0, 60)
    .map(
      (r) =>
        `• ${r.name}${r.categories?.length ? ` [${r.categories.join(", ")}]` : ""}`,
    )
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
• [NAV:/path] — navigate the user. Routes: ${Object.entries(NAV_ROUTES)
    .map(([p, l]) => `${p}=${l}`)
    .join(", ")}
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
function parseBlocks(content) {
  const choices = [];
  const recipeRefs = [];
  let hasNewRecipe = false;

  const text = content
    .replace(/\[CHOICE:\s*([^\]]+)\]/g, (_, c) => {
      choices.push(c.trim());
      return "";
    })
    .replace(/\[RECIPE:\s*([^\]]+)\]/g, (_, n) => {
      recipeRefs.push(n.trim());
      return "";
    })
    .replace(/\[NEW_RECIPE\]/g, () => {
      hasNewRecipe = true;
      return "";
    })
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

// ── Date helper ───────────────────────────────────────────────────────────────
function relativeDate(isoString) {
  const now = Date.now();
  const ts = new Date(isoString).getTime();
  const diff = now - ts;
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(isoString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

// ── Page component ────────────────────────────────────────────────────────────
export default function AssistantPage() {
  const navigate = useNavigate();
  const recipes = useRecipeStore((s) => s.recipes);
  const updateRecipe = useRecipeStore((s) => s.updateRecipe);
  const userName = useSetupStore((s) => s.profile?.name);

  // History store
  const conversations = useAssistantStore((s) => s.conversations);
  const saveConversation = useAssistantStore((s) => s.saveConversation);
  const deleteConversation = useAssistantStore((s) => s.deleteConversation);
  const restoreConversation = useAssistantStore((s) => s.restoreConversation);
  const clearAll = useAssistantStore((s) => s.clearAll);

  const [input, setInput] = useState("");
  const [greetOverride, setGreet] = useState(false);
  const [scannerText, setScannerText] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [convId, setConvId] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const {
    messages,
    streaming,
    send,
    status,
    progress,
    clear,
    reset,
    pendingActions,
    clearActions,
  } = useChefLLM();

  const systemPrompt = useMemo(
    () => buildSystemPrompt(recipes, userName),
    [recipes, userName],
  );

  const isLoading = status === "loading" || status === "thinking";
  const isEmpty = messages.length === 0 && !streaming;

  // ── Character mood ───────────────────────────────────────────────────────
  const llmMood =
    status === "loading" || status === "thinking"
      ? "thinking"
      : streaming
        ? "talking"
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

  // ── Auto-save conversation ───────────────────────────────────────────────
  useEffect(() => {
    if (!convId || messages.length === 0) return;
    saveConversation(convId, messages);
  }, [messages, convId, saveConversation]);

  // ── Execute LLM actions ──────────────────────────────────────────────────
  useEffect(() => {
    if (!pendingActions.length) return;
    for (const action of pendingActions) {
      switch (action.type) {
        case "navigate":
          if (action.payload in NAV_ROUTES) navigate(action.payload);
          break;
        case "like": {
          const m = recipes.find((r) =>
            r.name.toLowerCase().includes(action.payload.toLowerCase()),
          );
          if (m) updateRecipe(m.code, { liked: !m.liked });
          break;
        }
        case "flag": {
          const m = recipes.find((r) =>
            r.name.toLowerCase().includes(action.payload.toLowerCase()),
          );
          if (m) updateRecipe(m.code, { flagged: !m.flagged });
          break;
        }
      }
    }
    clearActions();
  }, [pendingActions, clearActions, navigate, recipes, updateRecipe]);

  // ── Conversation helpers ─────────────────────────────────────────────────
  const ensureConvId = () => {
    if (convId) return convId;
    const id = crypto.randomUUID();
    setConvId(id);
    return id;
  };

  const handleNewChat = () => {
    clear();
    setConvId(null);
    setHistoryOpen(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleLoadConversation = (conv) => {
    reset(conv.messages);
    setConvId(conv.id);
    setHistoryOpen(false);
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "instant" });
      inputRef.current?.focus();
    }, 50);
  };

  const handleDeleteConversation = (conv, e) => {
    e?.stopPropagation();
    deleteConversation(conv.id);
    // If deleting the active conversation, start fresh
    if (conv.id === convId) {
      clear();
      setConvId(null);
    }
    toast("Conversation deleted", {
      action: {
        label: "Undo",
        onClick: () => restoreConversation(conv),
      },
      duration: 4000,
    });
  };

  const handleClearAll = () => {
    const snapshot = [...conversations];
    clearAll();
    clear();
    setConvId(null);
    setHistoryOpen(false);
    toast(`${snapshot.length} conversation${snapshot.length === 1 ? "" : "s"} cleared`, {
      action: {
        label: "Undo",
        onClick: () => {
          snapshot.forEach((c) => restoreConversation(c));
        },
      },
      duration: 5000,
    });
  };

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    ensureConvId();
    send(text, systemPrompt);
  };

  const handleSuggestion = (text) => {
    if (isLoading || status === "unsupported") return;
    ensureConvId();
    send(text, systemPrompt);
  };

  const handleChoice = (text) => {
    if (isLoading || status === "unsupported") return;
    ensureConvId();
    send(text, systemPrompt);
    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      50,
    );
  };

  // ── Header actions ────────────────────────────────────────────────────────
  const headerAction = (
    <div className="flex items-center gap-1">
      {messages.length > 0 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNewChat}
            className="gap-1.5 text-muted-foreground"
          >
            <PlusIcon size={13} />
            New chat
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (convId && messages.length > 0) {
                const conv = conversations.find((c) => c.id === convId);
                if (conv) handleDeleteConversation(conv, null);
                else { clear(); setConvId(null); }
              } else { clear(); setConvId(null); }
            }}
            className="gap-1.5 text-muted-foreground"
          >
            <Trash2Icon size={13} />
            Clear
          </Button>
        </>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setHistoryOpen(true)}
        className="gap-1.5 text-muted-foreground"
        aria-label="Chat history"
      >
        <HistoryIcon size={13} />
        History
      </Button>
    </div>
  );

  return (
    <SidebarPage title="Kejal" header={headerAction} noScroll>
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
                  Your culinary assistant. Ask me anything about cooking, your
                  recipes, or what to make tonight.
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
              <div
                className="assistant-progress__fill"
                style={{ width: `${progress}%` }}
              />
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

      {/* ── History sheet ────────────────────────────────────────────── */}
      <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
        <SheetContent side="right" className="flex flex-col w-80 sm:w-96 p-0">
          <SheetHeader className="px-4 pt-5 pb-3 border-b shrink-0">
            <div className="flex items-center justify-between pr-7">
              <SheetTitle className="text-base">Chat History</SheetTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNewChat}
                className="gap-1.5 h-7 text-xs"
              >
                <PlusIcon size={12} />
                New chat
              </Button>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-center px-6 py-12">
                <HistoryIcon size={32} className="text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  No conversations yet.
                </p>
                <p className="text-xs text-muted-foreground/60">
                  Start chatting and your history will appear here.
                </p>
              </div>
            ) : (
              <ul className="py-1">
                {conversations.map((conv) => (
                  <li key={conv.id}>
                    <button
                      type="button"
                      className={`assistant-history-item${conv.id === convId ? " assistant-history-item--active" : ""}`}
                      onClick={() => handleLoadConversation(conv)}
                    >
                      <span className="assistant-history-item__title">
                        {conv.title}
                      </span>
                      <span className="assistant-history-item__meta">
                        {relativeDate(conv.updatedAt)}
                      </span>
                      <button
                        type="button"
                        className="assistant-history-item__del"
                        aria-label="Delete conversation"
                        onClick={(e) => handleDeleteConversation(conv, e)}
                      >
                        <Trash2Icon size={13} />
                      </button>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {conversations.length > 0 && (
            <div className="shrink-0 border-t px-4 py-3">
              <Button
                variant="ghost"
                size="sm"
                className="w-full gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleClearAll}
              >
                <Trash2Icon size={13} />
                Clear all history
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </SidebarPage>
  );
}

// ── Message component ─────────────────────────────────────────────────────────
function Message({
  role,
  content,
  isStreaming,
  onChoice,
  onScan,
  isLast,
  isLoading,
}) {
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
        <span className="asmsg__avatar" aria-hidden>
          🧑‍🍳
        </span>
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
      <span className="asmsg__avatar" aria-hidden>
        🧑‍🍳
      </span>
      <div className="asmsg__col">
        {text && <div className="asmsg__bubble">{text}</div>}

        {recipeRefs.map((name) => (
          <ChatRecipeCard key={name} recipeName={name} />
        ))}

        {hasNewRecipe && (
          <ChatAddRecipeButton messageText={content} onScan={onScan} />
        )}

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
      <span className="asmsg__avatar" aria-hidden>
        🧑‍🍳
      </span>
      <div className="asmsg__bubble chef-thinking-bubble">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
