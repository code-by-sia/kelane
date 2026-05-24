"use client";

import { useEffect, useMemo, useState } from "react";
import useRecipeStore from "@/store/recipe";
import useSetupStore from "@/store/setup";
import { useChefLLM } from "./use-chef-llm";
import { ChefCharacter } from "./chef-character";
import { ChatPanel } from "./chat-panel";
import "./chef-assistant.css";

// ── System prompt — injected with the user's recipe library ──────────────────
function buildSystemPrompt(recipes, userName) {
  const greeting = userName ? `The user's name is ${userName}.` : "";
  const list = recipes
    .slice(0, 60)
    .map((r) => `• ${r.name}${r.categories?.length ? ` [${r.categories.join(", ")}]` : ""}`)
    .join("\n");

  return `You are Hejar, a warm and knowledgeable Kurdish culinary assistant living inside Kelane, a recipe & meal planner app. You are Kurdish and proud of it — your personality reflects Kurdish hospitality and warmth. You may occasionally use Kurdish words or phrases naturally (e.g. Silav!, Supas!, Xweş bê!, Baş e!, Dê çêbibe!), but never Italian or any other language's expressions.

${greeting}

You help with:
- Suggesting recipes from the user's own collection
- Cooking tips, techniques, timing, and temperatures
- Ingredient substitutions when something is missing
- Meal planning — what to cook tonight, weekly plans
- Kurdish and Middle Eastern cuisine knowledge
- Food science, nutrition, and general kitchen questions

Rules:
- Keep answers concise: 2–4 sentences unless a detailed step-by-step is needed.
- Refer to specific recipes from the user's collection whenever relevant.
- Use a food emoji now and then 🍽️
- Never make up recipes not in the list as if they exist in the app.
- Be enthusiastic and warm in a Kurdish way — never Italian!

User's recipe collection (${recipes.length} recipe${recipes.length !== 1 ? "s" : ""}):
${list || "No recipes added yet — encourage them to scan or add some!"}`;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function ChefAssistant() {
  const [isOpen, setIsOpen]           = useState(false);
  const [greetOverride, setGreet]     = useState(false); // brief greeting pose on open

  const recipes  = useRecipeStore((s) => s.recipes);
  const userName = useSetupStore((s) => s.profile?.name);

  const { messages, streaming, send, status, progress, clear } = useChefLLM();

  const systemPrompt = useMemo(
    () => buildSystemPrompt(recipes, userName),
    [recipes, userName],
  );

  // When panel opens, briefly show the greeting pose
  useEffect(() => {
    if (isOpen) {
      setGreet(true);
      const t = setTimeout(() => setGreet(false), 1200);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Map LLM status → character mood
  const llmMood =
    status === "loading" || status === "thinking"
      ? "thinking"
      : streaming
        ? "talking"
        : "idle";

  const mood = greetOverride ? "greeting" : llmMood;

  const handleSend = (text) => send(text, systemPrompt);

  return (
    <div className="chef-assistant">
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
      />
    </div>
  );
}
