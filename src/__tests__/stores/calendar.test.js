/**
 * Tests for src/store/calendar.js
 */



let useCalendarStore;

beforeAll(() => {
  ({ default: useCalendarStore } = require("@/store/calendar"));
});

beforeEach(() => {
  localStorage.clear();
  useCalendarStore.setState({ meals: {} });
});

describe("addMeal", () => {
  test("adds a meal entry for a date", () => {
    useCalendarStore.getState().addMeal("2026-06-01", "r-001", "dinner");
    expect(useCalendarStore.getState().meals["2026-06-01"]).toHaveLength(1);
    expect(useCalendarStore.getState().meals["2026-06-01"][0]).toEqual({
      recipeCode: "r-001",
      slot: "dinner",
    });
  });

  test("allows multiple meals on the same date in different slots", () => {
    useCalendarStore.getState().addMeal("2026-06-01", "r-001", "lunch");
    useCalendarStore.getState().addMeal("2026-06-01", "r-002", "dinner");
    expect(useCalendarStore.getState().meals["2026-06-01"]).toHaveLength(2);
  });

  test("prevents duplicate meal (same recipe + slot on same date)", () => {
    useCalendarStore.getState().addMeal("2026-06-01", "r-001", "dinner");
    useCalendarStore.getState().addMeal("2026-06-01", "r-001", "dinner");
    expect(useCalendarStore.getState().meals["2026-06-01"]).toHaveLength(1);
  });

  test("allows the same recipe in a different slot", () => {
    useCalendarStore.getState().addMeal("2026-06-01", "r-001", "lunch");
    useCalendarStore.getState().addMeal("2026-06-01", "r-001", "dinner");
    expect(useCalendarStore.getState().meals["2026-06-01"]).toHaveLength(2);
  });
});

describe("removeMeal", () => {
  test("removes the matching meal entry", () => {
    useCalendarStore.getState().addMeal("2026-06-01", "r-001", "lunch");
    useCalendarStore.getState().addMeal("2026-06-01", "r-002", "dinner");
    useCalendarStore.getState().removeMeal("2026-06-01", "r-001", "lunch");
    const meals = useCalendarStore.getState().meals["2026-06-01"];
    expect(meals).toHaveLength(1);
    expect(meals[0].recipeCode).toBe("r-002");
  });

  test("removes the date key entirely when no meals remain", () => {
    useCalendarStore.getState().addMeal("2026-06-01", "r-001", "dinner");
    useCalendarStore.getState().removeMeal("2026-06-01", "r-001", "dinner");
    expect(useCalendarStore.getState().meals["2026-06-01"]).toBeUndefined();
  });
});

describe("getMealsForDate", () => {
  test("returns meals for a given date", () => {
    useCalendarStore.getState().addMeal("2026-06-15", "r-001", "breakfast");
    const meals = useCalendarStore.getState().getMealsForDate("2026-06-15");
    expect(meals).toHaveLength(1);
  });

  test("returns empty array for a date with no meals", () => {
    const meals = useCalendarStore.getState().getMealsForDate("2099-01-01");
    expect(meals).toEqual([]);
  });
});

describe("addMealToMultipleDays", () => {
  test("adds the meal to all specified dates", () => {
    useCalendarStore.getState().addMealToMultipleDays(
      ["2026-06-01", "2026-06-02", "2026-06-03"],
      "r-001",
      "dinner",
    );
    expect(useCalendarStore.getState().meals["2026-06-01"]).toHaveLength(1);
    expect(useCalendarStore.getState().meals["2026-06-02"]).toHaveLength(1);
    expect(useCalendarStore.getState().meals["2026-06-03"]).toHaveLength(1);
  });

  test("skips dates where the same recipe+slot already exists", () => {
    useCalendarStore.getState().addMeal("2026-06-01", "r-001", "dinner");
    useCalendarStore.getState().addMealToMultipleDays(["2026-06-01", "2026-06-02"], "r-001", "dinner");
    expect(useCalendarStore.getState().meals["2026-06-01"]).toHaveLength(1);
    expect(useCalendarStore.getState().meals["2026-06-02"]).toHaveLength(1);
  });
});
