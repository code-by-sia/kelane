/**
 * Tests for src/store/history.js
 */



let useHistoryStore;

beforeAll(() => {
  ({ default: useHistoryStore } = require("@/store/history"));
});

beforeEach(() => {
  localStorage.clear();
  useHistoryStore.setState({ entries: [] });
});

describe("startCooking", () => {
  test("creates a new entry with startedAt and null completedAt", () => {
    const id = useHistoryStore.getState().startCooking("r-001", "Margherita");
    const { entries } = useHistoryStore.getState();
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      id,
      recipeCode: "r-001",
      recipeName: "Margherita",
      completedAt: null,
    });
    expect(entries[0].startedAt).toBeTruthy();
  });

  test("returns a UUID-like string id", () => {
    const id = useHistoryStore.getState().startCooking("r-001", "Pizza");
    expect(typeof id).toBe("string");
    expect(id).toMatch(/^[0-9a-f-]{36}$/);
  });

  test("prepends new entries (most-recent first)", () => {
    useHistoryStore.getState().startCooking("r-001", "Pizza");
    useHistoryStore.getState().startCooking("r-002", "Pasta");
    const { entries } = useHistoryStore.getState();
    expect(entries[0].recipeName).toBe("Pasta");
    expect(entries[1].recipeName).toBe("Pizza");
  });
});

describe("completeCooking", () => {
  test("sets completedAt on the matching entry", () => {
    const id = useHistoryStore.getState().startCooking("r-001", "Pizza");
    useHistoryStore.getState().completeCooking(id);
    const entry = useHistoryStore.getState().entries.find((e) => e.id === id);
    expect(entry.completedAt).toBeTruthy();
  });

  test("does not affect other entries", () => {
    const id1 = useHistoryStore.getState().startCooking("r-001", "Pizza");
    useHistoryStore.getState().startCooking("r-002", "Pasta");
    useHistoryStore.getState().completeCooking(id1);
    const pasta = useHistoryStore.getState().entries.find((e) => e.recipeName === "Pasta");
    expect(pasta.completedAt).toBeNull();
  });

  test("is a no-op for unknown id", () => {
    useHistoryStore.getState().startCooking("r-001", "Pizza");
    useHistoryStore.getState().completeCooking("unknown-id");
    expect(useHistoryStore.getState().entries[0].completedAt).toBeNull();
  });
});

describe("removeEntry", () => {
  test("removes the entry with the given id", () => {
    const id = useHistoryStore.getState().startCooking("r-001", "Pizza");
    useHistoryStore.getState().removeEntry(id);
    expect(useHistoryStore.getState().entries).toHaveLength(0);
  });

  test("is a no-op for unknown id", () => {
    useHistoryStore.getState().startCooking("r-001", "Pizza");
    useHistoryStore.getState().removeEntry("non-existent");
    expect(useHistoryStore.getState().entries).toHaveLength(1);
  });
});
