export const EXPIRY_WARN_DAYS = 5;
export const RECENTLY_COOKED_SUPPRESS_DAYS = 3;
export const COOK_AGAIN_MIN_DAYS = 7;
export const COOK_AGAIN_MAX_DAYS = 30;
export const COOK_AGAIN_MIN_COVERAGE = 0.6;

export function isInStock(ingredient, fridgeItems) {
  return fridgeItems.some((item) =>
    ingredient.toLowerCase().includes(item.name.toLowerCase()),
  );
}

export function coverage(recipe, fridgeItems) {
  const total = recipe.ingredients?.length ?? 0;
  if (total === 0) return 0;
  const inStock = (recipe.ingredients ?? []).filter((ing) =>
    isInStock(ing, fridgeItems),
  ).length;
  return inStock / total;
}

/** Rough meal-time affinity from recipe name / categories (0=none, 1=breakfast, 2=lunch, 3=dinner) */
export function mealTimeAffinity(recipe) {
  const text = `${recipe.name} ${(recipe.categories ?? []).join(" ")}`.toLowerCase();
  if (/breakfast|pancake|oatmeal|granola|smoothie|waffle|egg|omelette|toast/.test(text)) return "breakfast";
  if (/lunch|salad|sandwich|wrap|soup|noodle|ramen/.test(text)) return "lunch";
  if (/dinner|supper|pasta|curry|roast|steak|casserole|stir.?fry|lasagne|risotto/.test(text)) return "dinner";
  return null;
}

export function currentMealPeriod() {
  const h = new Date().getHours();
  if (h >= 6 && h < 11)  return "breakfast";
  if (h >= 11 && h < 15) return "lunch";
  if (h >= 17 && h < 22) return "dinner";
  return null;
}
