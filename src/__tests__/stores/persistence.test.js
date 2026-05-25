/**
 * Persistence & hydration tests for Zustand stores.
 *
 * All stores now use Zustand's default localStorage storage (synchronous JSON).
 * Persistence tests verify that state changes are written to localStorage.
 * Hydration tests verify that a fresh store instance reads its initial state
 * from localStorage (simulating a page reload).
 */

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Return the parsed state object stored under the given Zustand store key. */
function storedState(storeKey) {
  const raw = localStorage.getItem(storeKey);
  if (!raw) return null;
  return JSON.parse(raw).state; // Zustand stores { state, version }
}

/** Flush pending microtasks so Zustand's persist subscriber fires. */
const tick = () => new Promise((r) => setTimeout(r, 0));

// ── Fixtures ──────────────────────────────────────────────────────────────────

const RECIPE_A = {
  code: "p-001", name: "Pizza", summary: "", date: "2026-01-01T00:00:00Z",
  categories: ["Bakery"], flagged: false, liked: true, calories: 800,
  prepTime: 30, servings: 4,
  image: "", images: [], tools: ["Oven"],
  ingredients: ["500g flour"],
  steps: [{ id: 1, action: "Mix", duration: 5, tools: [], ingredients: [], dependsOn: [] }],
};

const RECIPE_B = { ...RECIPE_A, code: "p-002", name: "Pasta", categories: ["Pasta"] };

// ─────────────────────────────────────────────────────────────────────────────
// 1. Recipe store — persistence
// ─────────────────────────────────────────────────────────────────────────────

describe("recipe store — persistence", () => {
  let useRecipeStore;

  beforeAll(() => {
    ({ default: useRecipeStore } = require("@/store/recipe"));
  });

  beforeEach(() => {
    localStorage.clear();
    useRecipeStore.setState({ recipes: [], categories: ["Bakery", "Pasta"] });
  });

  test("addRecipe writes partialised state to localStorage", async () => {
    useRecipeStore.getState().addRecipe(RECIPE_A);
    await tick();
    const saved = storedState("recipe-app-storage");
    expect(saved).not.toBeNull();
    expect(saved.recipes).toHaveLength(1);
    expect(saved.recipes[0].code).toBe("p-001");
    // Functions must NOT appear (JSON.stringify strips them)
    expect(typeof saved.addRecipe).toBe("undefined");
  });

  test("removeRecipe reflects in localStorage", async () => {
    useRecipeStore.setState({ recipes: [RECIPE_A, RECIPE_B] });
    useRecipeStore.getState().removeRecipe("p-001");
    await tick();
    const saved = storedState("recipe-app-storage");
    expect(saved.recipes).toHaveLength(1);
    expect(saved.recipes[0].code).toBe("p-002");
  });

  test("updateRecipe merges fields in localStorage", async () => {
    useRecipeStore.setState({ recipes: [RECIPE_A] });
    useRecipeStore.getState().updateRecipe("p-001", { liked: false, calories: 600 });
    await tick();
    const saved = storedState("recipe-app-storage");
    expect(saved.recipes[0].liked).toBe(false);
    expect(saved.recipes[0].calories).toBe(600);
    expect(saved.recipes[0].name).toBe("Pizza"); // unchanged
  });

  test("addCategory writes updated categories to localStorage", async () => {
    useRecipeStore.getState().addCategory("Soups");
    await tick();
    const saved = storedState("recipe-app-storage");
    expect(saved.categories).toContain("Soups");
  });

  test("updateCategory renames and propagates to recipes", async () => {
    useRecipeStore.setState({ recipes: [RECIPE_A], categories: ["Bakery"] });
    useRecipeStore.getState().updateCategory("Bakery", "Breads");
    await tick();
    const saved = storedState("recipe-app-storage");
    expect(saved.categories).toContain("Breads");
    expect(saved.categories).not.toContain("Bakery");
    expect(saved.recipes[0].categories).toContain("Breads");
  });

  test("seedDefaultRecipes writes built-in recipes to localStorage", async () => {
    useRecipeStore.setState({ recipes: [], categories: [] });
    useRecipeStore.getState().seedDefaultRecipes();
    await tick();
    const saved = storedState("recipe-app-storage");
    expect(saved.recipes.length).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Recipe store — hydration (simulates page reload)
// ─────────────────────────────────────────────────────────────────────────────

describe("recipe store — hydration from localStorage", () => {
  test("loads saved recipes and categories on fresh module import", () => {
    // 1. Seed localStorage with previously saved data
    localStorage.setItem(
      "recipe-app-storage",
      JSON.stringify({
        state: { recipes: [RECIPE_A, RECIPE_B], categories: ["Bakery", "Pasta"] },
        version: 0,
      }),
    );

    // 2. Import a fresh store (module isolation simulates a page reload)
    let freshStore;
    jest.isolateModules(() => {
      ({ default: freshStore } = require("@/store/recipe"));
    });

    // 3. With synchronous localStorage, the store is hydrated immediately
    expect(freshStore.getState().recipes).toHaveLength(2);
    expect(freshStore.getState().recipes[0].code).toBe("p-001");
    expect(freshStore.getState().categories).toEqual(["Bakery", "Pasta"]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Setup store — hydration (critical: drives the onboarding redirect)
// ─────────────────────────────────────────────────────────────────────────────

describe("setup store — hydration", () => {
  test("completed=true in localStorage prevents onboarding redirect", () => {
    localStorage.setItem(
      "kelane-setup-storage",
      JSON.stringify({
        state: {
          completed: true,
          step: 0,
          profile: { name: "Sia", email: "sia@example.com", avatar: "" },
          preferences: { dietaryTags: ["vegan"], seedExampleData: false },
        },
        version: 0,
      }),
    );

    let freshStore;
    jest.isolateModules(() => {
      ({ default: freshStore } = require("@/store/setup"));
    });

    expect(freshStore.getState().completed).toBe(true);
    expect(freshStore.getState().profile.name).toBe("Sia");
    expect(freshStore.getState().preferences.seedExampleData).toBe(false);
  });

  test("fresh install starts with completed=false (no localStorage entry)", () => {
    localStorage.clear();

    let freshStore;
    jest.isolateModules(() => {
      ({ default: freshStore } = require("@/store/setup"));
    });

    expect(freshStore.getState().completed).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Groceries store — persistence
// ─────────────────────────────────────────────────────────────────────────────

describe("groceries store — persistence", () => {
  let useGroceriesStore;

  beforeAll(() => {
    ({ default: useGroceriesStore } = require("@/store/groceries"));
  });

  beforeEach(() => {
    localStorage.clear();
    useGroceriesStore.setState({ fridgeItems: [], toBuyItems: [] });
  });

  test("addToBuyItem writes item to localStorage without functions", async () => {
    useGroceriesStore.getState().addToBuyItem({ name: "Eggs", quantity: 12, unit: "pcs" });
    await tick();
    const saved = storedState("groceries-storage");
    expect(saved.toBuyItems).toHaveLength(1);
    expect(saved.toBuyItems[0].name).toBe("Eggs");
    expect(typeof saved.addToBuyItem).toBe("undefined");
  });

  test("addFridgeItem writes fridge state to localStorage", async () => {
    useGroceriesStore.getState().addFridgeItem({ name: "Milk", quantity: 2, unit: "L" });
    await tick();
    const saved = storedState("groceries-storage");
    expect(saved.fridgeItems).toHaveLength(1);
    expect(saved.fridgeItems[0].name).toBe("Milk");
  });

  test("removeToBuyItem reflects deletion in localStorage", async () => {
    useGroceriesStore.getState().addToBuyItem({ name: "Sugar" });
    const id = useGroceriesStore.getState().toBuyItems[0].id;
    useGroceriesStore.getState().removeToBuyItem(id);
    await tick();
    const saved = storedState("groceries-storage");
    expect(saved.toBuyItems).toHaveLength(0);
  });

  test("hydration: loads groceries from localStorage on fresh import", () => {
    const existing = { fridgeItems: [{ id: "f1", name: "Butter", quantity: 1, unit: "kg", expiresAt: null }], toBuyItems: [] };
    localStorage.setItem("groceries-storage", JSON.stringify({ state: existing, version: 0 }));

    let freshStore;
    jest.isolateModules(() => {
      ({ default: freshStore } = require("@/store/groceries"));
    });

    expect(freshStore.getState().fridgeItems).toHaveLength(1);
    expect(freshStore.getState().fridgeItems[0].name).toBe("Butter");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Cook history — persistence & hydration
// ─────────────────────────────────────────────────────────────────────────────

describe("cook history store — persistence", () => {
  let useHistoryStore;

  beforeAll(() => {
    ({ default: useHistoryStore } = require("@/store/history"));
  });

  beforeEach(() => {
    localStorage.clear();
    useHistoryStore.setState({ entries: [] });
  });

  test("startCooking writes new entry to localStorage", async () => {
    useHistoryStore.getState().startCooking("pizza-001", "Margherita Pizza");
    await tick();
    const saved = storedState("cooking-history-storage");
    expect(saved.entries).toHaveLength(1);
    expect(saved.entries[0].recipeCode).toBe("pizza-001");
    expect(saved.entries[0].completedAt).toBeNull();
  });

  test("completeCooking sets completedAt in localStorage", async () => {
    const id = useHistoryStore.getState().startCooking("p-001", "Pizza");
    useHistoryStore.getState().completeCooking(id);
    await tick();
    const saved = storedState("cooking-history-storage");
    expect(saved.entries[0].completedAt).not.toBeNull();
  });

  test("functions are NOT present in localStorage payload", async () => {
    useHistoryStore.getState().startCooking("x", "X");
    await tick();
    const saved = storedState("cooking-history-storage");
    expect(typeof saved.startCooking).toBe("undefined");
  });

  test("hydration: entries restored from localStorage on fresh import", () => {
    const entry = { id: "e1", recipeCode: "r-001", recipeName: "Pasta", startedAt: "2026-01-01T10:00:00Z", completedAt: "2026-01-01T11:00:00Z" };
    localStorage.setItem("cooking-history-storage", JSON.stringify({ state: { entries: [entry] }, version: 0 }));

    let freshStore;
    jest.isolateModules(() => {
      ({ default: freshStore } = require("@/store/history"));
    });

    expect(freshStore.getState().entries).toHaveLength(1);
    expect(freshStore.getState().entries[0].recipeCode).toBe("r-001");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. Chat history (assistant) — persistence & hydration
// ─────────────────────────────────────────────────────────────────────────────

describe("assistant store — persistence", () => {
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

  test("saveConversation writes to localStorage", async () => {
    useAssistantStore.getState().saveConversation("conv-1", [MSG_USER, MSG_ASST]);
    await tick();
    const saved = storedState("assistant-storage");
    expect(saved.conversations).toHaveLength(1);
    expect(saved.conversations[0].id).toBe("conv-1");
    expect(saved.conversations[0].title).toBe("What should I cook?");
  });

  test("deleteConversation removes from localStorage", async () => {
    useAssistantStore.getState().saveConversation("conv-1", [MSG_USER]);
    useAssistantStore.getState().deleteConversation("conv-1");
    await tick();
    const saved = storedState("assistant-storage");
    expect(saved.conversations).toHaveLength(0);
  });

  test("functions are NOT present in localStorage payload", async () => {
    useAssistantStore.getState().saveConversation("c", [MSG_USER]);
    await tick();
    const saved = storedState("assistant-storage");
    expect(typeof saved.saveConversation).toBe("undefined");
  });

  test("hydration: conversations restored from localStorage on fresh import", () => {
    const conv = {
      id: "c1", title: "Old chat", messages: [MSG_USER],
      createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z",
    };
    localStorage.setItem("assistant-storage", JSON.stringify({ state: { conversations: [conv] }, version: 0 }));

    let freshStore;
    jest.isolateModules(() => {
      ({ default: freshStore } = require("@/store/assistant"));
    });

    expect(freshStore.getState().conversations).toHaveLength(1);
    expect(freshStore.getState().conversations[0].id).toBe("c1");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. Settings & feeds — persistence
// ─────────────────────────────────────────────────────────────────────────────

describe("settings store — persistence", () => {
  let useSettingsStore;

  beforeAll(() => {
    ({ default: useSettingsStore } = require("@/store/settings"));
  });

  beforeEach(() => {
    localStorage.clear();
    useSettingsStore.setState({ proxyPresetId: "allorigins", customProxyPrefix: "", themeId: "tomato", chefTemperature: 0.72 });
  });

  test("setTheme persists to localStorage", async () => {
    useSettingsStore.getState().setTheme("sage");
    await tick();
    const saved = storedState("kelane-settings");
    expect(saved.themeId).toBe("sage");
    expect(typeof saved.setTheme).toBe("undefined");
  });
});

describe("feeds store — persistence", () => {
  let useFeedsStore;

  beforeAll(() => {
    ({ default: useFeedsStore } = require("@/store/feeds"));
  });

  beforeEach(() => {
    localStorage.clear();
    useFeedsStore.setState({ feeds: [{ id: "default-bbc", title: "BBC", url: "https://bbc.com/feed" }] });
  });

  test("addFeed writes to localStorage without functions", async () => {
    useFeedsStore.getState().addFeed({ title: "My Blog", url: "https://myblog.com/feed" });
    await tick();
    const saved = storedState("feeds-storage");
    expect(saved.feeds).toHaveLength(2);
    expect(typeof saved.addFeed).toBe("undefined");
  });
});
