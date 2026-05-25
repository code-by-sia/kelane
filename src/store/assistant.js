/**
 * Assistant conversation store.
 * Persists chat history to localStorage under "assistant-storage".
 *
 * Each conversation:
 *   id         — UUID (generated on first message)
 *   title      — first user message, truncated to 60 chars
 *   messages   — [{role, content}]
 *   createdAt  — ISO timestamp
 *   updatedAt  — ISO timestamp
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { idbStorage } from "@/lib/idb-storage";

const useAssistantStore = create(
  persist(
    (set, get) => ({
      conversations: [], // most-recent first

      /** Create or update a conversation. */
      saveConversation: (id, messages) => {
        if (!messages.length) return;
        const { conversations } = get();
        const firstUser = messages.find((m) => m.role === "user");
        const title = (firstUser?.content ?? "Conversation").slice(0, 60);
        const now = new Date().toISOString();
        const existing = conversations.find((c) => c.id === id);

        if (existing) {
          set({
            conversations: conversations.map((c) =>
              c.id === id ? { ...c, messages, title, updatedAt: now } : c
            ),
          });
        } else {
          set({
            conversations: [
              { id, title, messages, createdAt: now, updatedAt: now },
              ...conversations,
            ],
          });
        }
      },

      /** Hard-delete a conversation by id. */
      deleteConversation: (id) =>
        set({
          conversations: get().conversations.filter((c) => c.id !== id),
        }),

      /** Restore a previously deleted conversation (for undo). */
      restoreConversation: (conv) =>
        set({
          conversations: [conv, ...get().conversations].sort(
            (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
          ),
        }),

      /** Wipe everything. */
      clearAll: () => set({ conversations: [] }),
    }),
    { name: "assistant-storage", storage: idbStorage }
  )
);

export default useAssistantStore;
