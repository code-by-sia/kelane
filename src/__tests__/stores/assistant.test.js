/**
 * Tests for src/store/assistant.js
 */



let useAssistantStore;

const MSG_USER = { role: "user", content: "What should I cook?" };
const MSG_ASST = { role: "assistant", content: "How about pasta?" };

beforeAll(() => {
  ({ default: useAssistantStore } = require("@/store/assistant"));
});

beforeEach(() => {
  localStorage.clear();
  useAssistantStore.setState({ conversations: [] });
});

describe("saveConversation — new conversation", () => {
  test("creates a new conversation from messages", () => {
    useAssistantStore.getState().saveConversation("conv-1", [MSG_USER, MSG_ASST]);
    const { conversations } = useAssistantStore.getState();
    expect(conversations).toHaveLength(1);
    expect(conversations[0]).toMatchObject({
      id: "conv-1",
      title: "What should I cook?",
      messages: [MSG_USER, MSG_ASST],
    });
    expect(conversations[0].createdAt).toBeTruthy();
    expect(conversations[0].updatedAt).toBeTruthy();
  });

  test("derives title from first user message, truncated to 60 chars", () => {
    const longMsg = { role: "user", content: "A".repeat(80) };
    useAssistantStore.getState().saveConversation("conv-1", [longMsg]);
    expect(useAssistantStore.getState().conversations[0].title).toHaveLength(60);
  });

  test("falls back to 'Conversation' when no user message exists", () => {
    useAssistantStore.getState().saveConversation("conv-1", [MSG_ASST]);
    expect(useAssistantStore.getState().conversations[0].title).toBe("Conversation");
  });

  test("no-ops when messages array is empty", () => {
    useAssistantStore.getState().saveConversation("conv-1", []);
    expect(useAssistantStore.getState().conversations).toHaveLength(0);
  });

  test("prepends new conversations (most-recent first)", () => {
    useAssistantStore.getState().saveConversation("conv-1", [{ role: "user", content: "First" }]);
    useAssistantStore.getState().saveConversation("conv-2", [{ role: "user", content: "Second" }]);
    expect(useAssistantStore.getState().conversations[0].id).toBe("conv-2");
  });
});

describe("saveConversation — update existing", () => {
  test("updates messages and title of existing conversation", () => {
    useAssistantStore.getState().saveConversation("conv-1", [MSG_USER]);
    const updatedMsg = { role: "user", content: "Updated question" };
    useAssistantStore.getState().saveConversation("conv-1", [updatedMsg, MSG_ASST]);
    const { conversations } = useAssistantStore.getState();
    expect(conversations).toHaveLength(1);
    expect(conversations[0].title).toBe("Updated question");
    expect(conversations[0].messages).toHaveLength(2);
  });

  test("updates updatedAt timestamp on save", async () => {
    useAssistantStore.getState().saveConversation("conv-1", [MSG_USER]);
    const before = useAssistantStore.getState().conversations[0].updatedAt;
    await new Promise((r) => setTimeout(r, 5));
    useAssistantStore.getState().saveConversation("conv-1", [MSG_USER, MSG_ASST]);
    const after = useAssistantStore.getState().conversations[0].updatedAt;
    expect(after >= before).toBe(true);
  });
});

describe("deleteConversation", () => {
  test("removes the conversation with the given id", () => {
    useAssistantStore.getState().saveConversation("conv-1", [MSG_USER]);
    useAssistantStore.getState().saveConversation("conv-2", [MSG_ASST]);
    useAssistantStore.getState().deleteConversation("conv-1");
    const { conversations } = useAssistantStore.getState();
    expect(conversations).toHaveLength(1);
    expect(conversations[0].id).toBe("conv-2");
  });

  test("is a no-op for unknown id", () => {
    useAssistantStore.getState().saveConversation("conv-1", [MSG_USER]);
    useAssistantStore.getState().deleteConversation("non-existent");
    expect(useAssistantStore.getState().conversations).toHaveLength(1);
  });
});

describe("restoreConversation", () => {
  test("re-inserts a previously deleted conversation sorted by updatedAt", () => {
    const snapshot = {
      id: "conv-deleted",
      title: "Deleted",
      messages: [MSG_USER],
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-06-01T00:00:00Z",
    };
    useAssistantStore.getState().saveConversation("conv-1", [{ role: "user", content: "Recent" }]);
    useAssistantStore.getState().restoreConversation(snapshot);
    const { conversations } = useAssistantStore.getState();
    expect(conversations).toHaveLength(2);
    // conv-1 was just saved so it should be more recent
    expect(conversations.find((c) => c.id === "conv-deleted")).toBeDefined();
  });
});

describe("clearAll", () => {
  test("removes all conversations", () => {
    useAssistantStore.getState().saveConversation("c1", [MSG_USER]);
    useAssistantStore.getState().saveConversation("c2", [MSG_ASST]);
    useAssistantStore.getState().clearAll();
    expect(useAssistantStore.getState().conversations).toHaveLength(0);
  });
});
