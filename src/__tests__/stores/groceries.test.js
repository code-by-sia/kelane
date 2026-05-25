/**
 * Tests for src/store/groceries.js
 */



let useGroceriesStore;

beforeAll(() => {
  ({ default: useGroceriesStore } = require("@/store/groceries"));
});

beforeEach(() => {
  localStorage.clear();
  useGroceriesStore.setState({ fridgeItems: [], toBuyItems: [] });
});

// ── Fridge ────────────────────────────────────────────────────────────────────

describe("addFridgeItem", () => {
  test("adds a new item when none with that name exists", () => {
    useGroceriesStore.getState().addFridgeItem({ name: "Tomato", quantity: 3, unit: "pcs" });
    const { fridgeItems } = useGroceriesStore.getState();
    expect(fridgeItems).toHaveLength(1);
    expect(fridgeItems[0]).toMatchObject({ name: "Tomato", quantity: 3 });
    expect(fridgeItems[0].id).toBeDefined();
  });

  test("merges quantity when item with same name already exists", () => {
    useGroceriesStore.getState().addFridgeItem({ name: "Tomato", quantity: 3, unit: "pcs" });
    useGroceriesStore.getState().addFridgeItem({ name: "Tomato", quantity: 2, unit: "pcs" });
    const { fridgeItems } = useGroceriesStore.getState();
    expect(fridgeItems).toHaveLength(1);
    expect(fridgeItems[0].quantity).toBe(5);
  });

  test("case-insensitive name matching on merge", () => {
    useGroceriesStore.getState().addFridgeItem({ name: "tomato", quantity: 1 });
    useGroceriesStore.getState().addFridgeItem({ name: "Tomato", quantity: 2 });
    expect(useGroceriesStore.getState().fridgeItems).toHaveLength(1);
    expect(useGroceriesStore.getState().fridgeItems[0].quantity).toBe(3);
  });

  test("merges even when existing item has null quantity (treated as 0)", () => {
    useGroceriesStore.getState().addFridgeItem({ name: "Milk", quantity: null });
    useGroceriesStore.getState().addFridgeItem({ name: "Milk", quantity: 2 });
    // null ?? 0 + 2 = 2 — still results in one merged item
    expect(useGroceriesStore.getState().fridgeItems).toHaveLength(1);
    expect(useGroceriesStore.getState().fridgeItems[0].quantity).toBe(2);
  });
});

describe("removeFridgeItem", () => {
  test("removes the item with the given id", () => {
    useGroceriesStore.getState().addFridgeItem({ name: "Cheese", quantity: 1 });
    const { fridgeItems } = useGroceriesStore.getState();
    useGroceriesStore.getState().removeFridgeItem(fridgeItems[0].id);
    expect(useGroceriesStore.getState().fridgeItems).toHaveLength(0);
  });
});

describe("removeFridgeItems", () => {
  test("removes multiple items by id set", () => {
    useGroceriesStore.getState().addFridgeItem({ name: "A" });
    useGroceriesStore.getState().addFridgeItem({ name: "B" });
    useGroceriesStore.getState().addFridgeItem({ name: "C" });
    const ids = new Set(useGroceriesStore.getState().fridgeItems.slice(0, 2).map((i) => i.id));
    useGroceriesStore.getState().removeFridgeItems(ids);
    expect(useGroceriesStore.getState().fridgeItems).toHaveLength(1);
    expect(useGroceriesStore.getState().fridgeItems[0].name).toBe("C");
  });
});

describe("updateFridgeItemsExpiry", () => {
  test("sets expiresAt on all matching ids", () => {
    useGroceriesStore.getState().addFridgeItem({ name: "Milk" });
    useGroceriesStore.getState().addFridgeItem({ name: "Eggs" });
    const ids = new Set(useGroceriesStore.getState().fridgeItems.map((i) => i.id));
    useGroceriesStore.getState().updateFridgeItemsExpiry(ids, "2026-12-31");
    useGroceriesStore.getState().fridgeItems.forEach((i) => {
      expect(i.expiresAt).toBe("2026-12-31");
    });
  });
});

describe("deductFridgeIngredient", () => {
  test("reduces quantity by the given amount", () => {
    useGroceriesStore.getState().addFridgeItem({ name: "flour", quantity: 500 });
    useGroceriesStore.getState().deductFridgeIngredient("flour", 200);
    expect(useGroceriesStore.getState().fridgeItems[0].quantity).toBe(300);
  });

  test("removes item when quantity reaches zero", () => {
    useGroceriesStore.getState().addFridgeItem({ name: "flour", quantity: 200 });
    useGroceriesStore.getState().deductFridgeIngredient("flour", 200);
    expect(useGroceriesStore.getState().fridgeItems).toHaveLength(0);
  });

  test("removes item when result is negative", () => {
    useGroceriesStore.getState().addFridgeItem({ name: "flour", quantity: 100 });
    useGroceriesStore.getState().deductFridgeIngredient("flour", 300);
    expect(useGroceriesStore.getState().fridgeItems).toHaveLength(0);
  });

  test("removes item with null quantity (untracked)", () => {
    useGroceriesStore.getState().addFridgeItem({ name: "butter", quantity: null });
    useGroceriesStore.getState().deductFridgeIngredient("butter", null);
    expect(useGroceriesStore.getState().fridgeItems).toHaveLength(0);
  });

  test("is a no-op for unknown ingredient", () => {
    useGroceriesStore.getState().addFridgeItem({ name: "flour", quantity: 100 });
    useGroceriesStore.getState().deductFridgeIngredient("sugar", 50);
    expect(useGroceriesStore.getState().fridgeItems).toHaveLength(1);
  });
});

describe("moveFridgeToBuy", () => {
  test("moves a fridge item back to the shopping list", () => {
    useGroceriesStore.getState().addFridgeItem({ name: "Butter", quantity: 2, unit: "pcs" });
    const id = useGroceriesStore.getState().fridgeItems[0].id;
    useGroceriesStore.getState().moveFridgeToBuy(new Set([id]));
    expect(useGroceriesStore.getState().fridgeItems).toHaveLength(0);
    expect(useGroceriesStore.getState().toBuyItems).toHaveLength(1);
    expect(useGroceriesStore.getState().toBuyItems[0]).toMatchObject({ name: "Butter", checked: false });
  });
});

// ── Shopping list ─────────────────────────────────────────────────────────────

describe("addToBuyItem", () => {
  test("adds a new shopping list item with default checked=false", () => {
    useGroceriesStore.getState().addToBuyItem({ name: "Sugar", quantity: 1, unit: "kg" });
    const { toBuyItems } = useGroceriesStore.getState();
    expect(toBuyItems).toHaveLength(1);
    expect(toBuyItems[0]).toMatchObject({ name: "Sugar", checked: false });
    expect(toBuyItems[0].id).toBeDefined();
  });
});

describe("removeToBuyItem", () => {
  test("removes the item by id", () => {
    useGroceriesStore.getState().addToBuyItem({ name: "Salt" });
    const id = useGroceriesStore.getState().toBuyItems[0].id;
    useGroceriesStore.getState().removeToBuyItem(id);
    expect(useGroceriesStore.getState().toBuyItems).toHaveLength(0);
  });
});

describe("removeToBuyItems", () => {
  test("removes multiple items by id set", () => {
    useGroceriesStore.getState().addToBuyItem({ name: "A" });
    useGroceriesStore.getState().addToBuyItem({ name: "B" });
    const ids = new Set(useGroceriesStore.getState().toBuyItems.map((i) => i.id));
    useGroceriesStore.getState().removeToBuyItems(ids);
    expect(useGroceriesStore.getState().toBuyItems).toHaveLength(0);
  });
});

describe("toggleToBuyItem", () => {
  test("flips checked from false to true", () => {
    useGroceriesStore.getState().addToBuyItem({ name: "Eggs" });
    const id = useGroceriesStore.getState().toBuyItems[0].id;
    useGroceriesStore.getState().toggleToBuyItem(id);
    expect(useGroceriesStore.getState().toBuyItems[0].checked).toBe(true);
  });

  test("flips checked from true to false", () => {
    useGroceriesStore.getState().addToBuyItem({ name: "Eggs" });
    const id = useGroceriesStore.getState().toBuyItems[0].id;
    useGroceriesStore.getState().toggleToBuyItem(id);
    useGroceriesStore.getState().toggleToBuyItem(id);
    expect(useGroceriesStore.getState().toBuyItems[0].checked).toBe(false);
  });
});

describe("clearCheckedToBuyItems", () => {
  test("removes only checked items", () => {
    useGroceriesStore.getState().addToBuyItem({ name: "Checked" });
    useGroceriesStore.getState().addToBuyItem({ name: "Unchecked" });
    const id = useGroceriesStore.getState().toBuyItems[0].id;
    useGroceriesStore.getState().toggleToBuyItem(id);
    useGroceriesStore.getState().clearCheckedToBuyItems();
    const { toBuyItems } = useGroceriesStore.getState();
    expect(toBuyItems).toHaveLength(1);
    expect(toBuyItems[0].name).toBe("Unchecked");
  });
});

describe("moveToFridge", () => {
  test("moves item from shopping list to fridge with expiresAt", () => {
    useGroceriesStore.getState().addToBuyItem({ name: "Milk", quantity: 2, unit: "l" });
    const id = useGroceriesStore.getState().toBuyItems[0].id;
    useGroceriesStore.getState().moveToFridge(id, "2026-12-01");
    expect(useGroceriesStore.getState().toBuyItems).toHaveLength(0);
    const { fridgeItems } = useGroceriesStore.getState();
    expect(fridgeItems).toHaveLength(1);
    expect(fridgeItems[0]).toMatchObject({ name: "Milk", expiresAt: "2026-12-01" });
  });

  test("is a no-op for unknown id", () => {
    useGroceriesStore.getState().moveToFridge("non-existent", null);
    expect(useGroceriesStore.getState().fridgeItems).toHaveLength(0);
  });
});

describe("moveMultipleToFridge", () => {
  test("moves selected items to fridge and removes all specified ids from list", () => {
    useGroceriesStore.getState().addToBuyItem({ name: "A" });
    useGroceriesStore.getState().addToBuyItem({ name: "B" });
    useGroceriesStore.getState().addToBuyItem({ name: "C" });
    const items = useGroceriesStore.getState().toBuyItems;
    const fridgeIds = new Set([items[0].id]);
    const removeIds = new Set([items[1].id]);
    useGroceriesStore.getState().moveMultipleToFridge(fridgeIds, removeIds, "2026-12-01");
    expect(useGroceriesStore.getState().toBuyItems).toHaveLength(1); // C remains
    expect(useGroceriesStore.getState().fridgeItems).toHaveLength(1); // A moved to fridge
  });
});
