/**
 * Tests for src/store/recipe.js
 */



let useRecipeStore;
const DEFAULT_CATEGORIES = ["Bakery", "Vegan", "Healthy", "Fish", "Pasta", "Dessert"];

const RECIPE_A = {
  code: "test-001",
  name: "Test Pizza",
  summary: "A test pizza",
  date: "2026-01-01T00:00:00Z",
  categories: ["Bakery"],
  flagged: false,
  liked: true,
  calories: 800,
  prepTime: 30,
  image: "https://example.com/pizza.jpg",
  images: ["https://example.com/pizza.jpg"],
  ingredients: ["flour", "tomato", "cheese"],
  tools: ["oven"],
  steps: [{ id: 1, action: "Mix", duration: 5, dependsOn: [] }],
};

const RECIPE_B = {
  ...RECIPE_A,
  code: "test-002",
  name: "Test Pasta",
  categories: ["Pasta"],
  liked: false,
  flagged: true,
};

const RECIPE_C = {
  ...RECIPE_A,
  code: "test-003",
  name: "Uncategorized",
  categories: [],
  liked: false,
  flagged: false,
};

beforeAll(() => {
  ({ default: useRecipeStore } = require("@/store/recipe"));
});

beforeEach(() => {
  localStorage.clear();
  useRecipeStore.setState({ recipes: [RECIPE_A, RECIPE_B], categories: DEFAULT_CATEGORIES });
});

// ── Selectors ─────────────────────────────────────────────────────────────────

describe("getRecipe", () => {
  test("finds recipe by numeric code", () => {
    const store = useRecipeStore.getState();
    expect(store.getRecipe("test-001")).toMatchObject({ name: "Test Pizza" });
  });

  test("returns undefined for unknown code", () => {
    expect(useRecipeStore.getState().getRecipe("nope")).toBeUndefined();
  });
});

describe("getRecipesInCategory", () => {
  test("returns recipes matching the category", () => {
    const results = useRecipeStore.getState().getRecipesInCategory("Bakery");
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("Test Pizza");
  });

  test("returns empty array for unknown category", () => {
    expect(useRecipeStore.getState().getRecipesInCategory("Vegan")).toHaveLength(0);
  });
});

describe("getFavoriteRecipes", () => {
  test("returns only liked recipes", () => {
    const favs = useRecipeStore.getState().getFavoriteRecipes();
    expect(favs).toHaveLength(1);
    expect(favs[0].code).toBe("test-001");
  });
});

describe("getFlaggedRecipes", () => {
  test("returns only flagged recipes", () => {
    const flagged = useRecipeStore.getState().getFlaggedRecipes();
    expect(flagged).toHaveLength(1);
    expect(flagged[0].code).toBe("test-002");
  });
});

describe("getUncategorizedRecipes", () => {
  test("returns recipes with empty categories array", () => {
    useRecipeStore.setState({ recipes: [RECIPE_A, RECIPE_C] });
    const uncategorized = useRecipeStore.getState().getUncategorizedRecipes();
    expect(uncategorized).toHaveLength(1);
    expect(uncategorized[0].code).toBe("test-003");
  });
});

describe("getCategoriesWithCounts", () => {
  test("returns each category with its recipe count", () => {
    const counts = useRecipeStore.getState().getCategoriesWithCounts();
    const bakery = counts.find((c) => c.name === "Bakery");
    const pasta = counts.find((c) => c.name === "Pasta");
    const vegan = counts.find((c) => c.name === "Vegan");
    expect(bakery.recipes).toBe(1);
    expect(pasta.recipes).toBe(1);
    expect(vegan.recipes).toBe(0);
  });
});

// ── Mutators ──────────────────────────────────────────────────────────────────

describe("addRecipe", () => {
  test("appends a new recipe", () => {
    useRecipeStore.getState().addRecipe(RECIPE_C);
    expect(useRecipeStore.getState().recipes).toHaveLength(3);
    expect(useRecipeStore.getState().getRecipe("test-003")).toBeDefined();
  });
});

describe("removeRecipe", () => {
  test("removes a recipe by code", () => {
    useRecipeStore.getState().removeRecipe("test-001");
    const { recipes } = useRecipeStore.getState();
    expect(recipes).toHaveLength(1);
    expect(recipes[0].code).toBe("test-002");
  });

  test("no-ops for unknown code", () => {
    useRecipeStore.getState().removeRecipe("unknown");
    expect(useRecipeStore.getState().recipes).toHaveLength(2);
  });
});

describe("updateRecipe", () => {
  test("merges updated fields onto the matching recipe", () => {
    useRecipeStore.getState().updateRecipe("test-001", { liked: false, calories: 500 });
    const recipe = useRecipeStore.getState().getRecipe("test-001");
    expect(recipe.liked).toBe(false);
    expect(recipe.calories).toBe(500);
    expect(recipe.name).toBe("Test Pizza"); // unchanged
  });

  test("does not affect other recipes", () => {
    useRecipeStore.getState().updateRecipe("test-001", { liked: false });
    expect(useRecipeStore.getState().getRecipe("test-002").liked).toBe(false);
  });
});

describe("mergeRecipes", () => {
  test("adds only recipes whose code does not already exist", () => {
    useRecipeStore.getState().mergeRecipes([
      RECIPE_A,  // duplicate — should be skipped
      RECIPE_C,  // new — should be added
    ]);
    expect(useRecipeStore.getState().recipes).toHaveLength(3);
  });

  test("adds all recipes when none overlap", () => {
    useRecipeStore.getState().mergeRecipes([RECIPE_C]);
    expect(useRecipeStore.getState().recipes).toHaveLength(3);
  });
});

describe("replaceRecipes", () => {
  test("replaces all recipes and categories", () => {
    useRecipeStore.getState().replaceRecipes([RECIPE_C], ["Snacks"]);
    expect(useRecipeStore.getState().recipes).toHaveLength(1);
    expect(useRecipeStore.getState().categories).toEqual(["Snacks"]);
  });
});

describe("seedDefaultRecipes", () => {
  test("seeds built-in example recipes into an empty library", () => {
    useRecipeStore.setState({ recipes: [], categories: DEFAULT_CATEGORIES });
    useRecipeStore.getState().seedDefaultRecipes();
    expect(useRecipeStore.getState().recipes.length).toBeGreaterThan(0);
  });

  test("does not duplicate recipes already present", () => {
    useRecipeStore.getState().seedDefaultRecipes();
    const countAfterFirst = useRecipeStore.getState().recipes.length;
    useRecipeStore.getState().seedDefaultRecipes();
    expect(useRecipeStore.getState().recipes.length).toBe(countAfterFirst);
  });

  test("is a no-op when called on a store with matching codes", () => {
    useRecipeStore.getState().seedDefaultRecipes();
    const count = useRecipeStore.getState().recipes.length;
    useRecipeStore.getState().seedDefaultRecipes();
    expect(useRecipeStore.getState().recipes).toHaveLength(count);
  });
});

// ── Categories ────────────────────────────────────────────────────────────────

describe("addCategory", () => {
  test("appends a new category", () => {
    useRecipeStore.getState().addCategory("Soups");
    expect(useRecipeStore.getState().categories).toContain("Soups");
  });

  test("ignores duplicates", () => {
    useRecipeStore.getState().addCategory("Bakery");
    const count = useRecipeStore.getState().categories.filter((c) => c === "Bakery").length;
    expect(count).toBe(1);
  });
});

describe("removeCategory", () => {
  test("removes a category by name", () => {
    useRecipeStore.getState().removeCategory("Bakery");
    expect(useRecipeStore.getState().categories).not.toContain("Bakery");
  });
});

describe("updateCategory", () => {
  test("renames a category and updates all recipes that reference it", () => {
    useRecipeStore.getState().updateCategory("Bakery", "Breads");
    expect(useRecipeStore.getState().categories).toContain("Breads");
    expect(useRecipeStore.getState().categories).not.toContain("Bakery");
    expect(useRecipeStore.getState().getRecipe("test-001").categories).toContain("Breads");
  });

  test("no-ops if the new name already exists", () => {
    useRecipeStore.getState().updateCategory("Bakery", "Pasta");
    // Both should still be present
    expect(useRecipeStore.getState().categories).toContain("Bakery");
    expect(useRecipeStore.getState().categories).toContain("Pasta");
  });
});
