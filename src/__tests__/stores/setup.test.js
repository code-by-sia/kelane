/**
 * Tests for src/store/setup.js
 */



let useSetupStore;

const INITIAL_STATE = {
  completed: false,
  step: 0,
  profile: { name: "", email: "", avatar: "" },
  preferences: { dietaryTags: [], seedExampleData: true },
};

beforeAll(() => {
  ({ default: useSetupStore } = require("@/store/setup"));
});

beforeEach(() => {
  localStorage.clear();
  useSetupStore.setState(INITIAL_STATE);
});

describe("setStep", () => {
  test("updates the wizard step index", () => {
    useSetupStore.getState().setStep(2);
    expect(useSetupStore.getState().step).toBe(2);
  });
});

describe("setProfile", () => {
  test("merges profile fields", () => {
    useSetupStore.getState().setProfile({ name: "Sia", email: "sia@example.com" });
    expect(useSetupStore.getState().profile).toMatchObject({
      name: "Sia",
      email: "sia@example.com",
      avatar: "", // unchanged
    });
  });

  test("partial update preserves other profile fields", () => {
    useSetupStore.getState().setProfile({ name: "Sia" });
    useSetupStore.getState().setProfile({ avatar: "🧑‍🍳" });
    expect(useSetupStore.getState().profile.name).toBe("Sia");
    expect(useSetupStore.getState().profile.avatar).toBe("🧑‍🍳");
  });
});

describe("setDietaryTags", () => {
  test("sets dietary tags in preferences", () => {
    useSetupStore.getState().setDietaryTags(["Vegan", "Gluten-free"]);
    expect(useSetupStore.getState().preferences.dietaryTags).toEqual(["Vegan", "Gluten-free"]);
  });

  test("replaces previous tags entirely", () => {
    useSetupStore.getState().setDietaryTags(["Vegan"]);
    useSetupStore.getState().setDietaryTags(["Keto"]);
    expect(useSetupStore.getState().preferences.dietaryTags).toEqual(["Keto"]);
  });
});

describe("completeSetup", () => {
  test("marks completed as true and resets step to 0", () => {
    useSetupStore.getState().setStep(3);
    useSetupStore.getState().completeSetup();
    expect(useSetupStore.getState().completed).toBe(true);
    expect(useSetupStore.getState().step).toBe(0);
  });
});

describe("resetSetup", () => {
  test("marks completed as false and resets step to 0", () => {
    useSetupStore.getState().completeSetup();
    useSetupStore.getState().resetSetup();
    expect(useSetupStore.getState().completed).toBe(false);
    expect(useSetupStore.getState().step).toBe(0);
  });
});

describe("setSeedExampleData", () => {
  test("sets seedExampleData to false", () => {
    useSetupStore.getState().setSeedExampleData(false);
    expect(useSetupStore.getState().preferences.seedExampleData).toBe(false);
  });

  test("sets seedExampleData to true", () => {
    useSetupStore.setState({ preferences: { dietaryTags: [], seedExampleData: false } });
    useSetupStore.getState().setSeedExampleData(true);
    expect(useSetupStore.getState().preferences.seedExampleData).toBe(true);
  });

  test("preserves other preference fields", () => {
    useSetupStore.setState({ preferences: { dietaryTags: ["vegan"], seedExampleData: true } });
    useSetupStore.getState().setSeedExampleData(false);
    expect(useSetupStore.getState().preferences.dietaryTags).toEqual(["vegan"]);
  });
});
