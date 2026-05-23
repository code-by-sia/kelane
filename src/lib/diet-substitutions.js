/**
 * Rule-based ingredient substitution maps for common dietary requirements.
 * Each key is a pattern (matched case-insensitively as a substring).
 * Values are the suggested replacement ingredient.
 *
 * Matches are tried longest-first within each diet so more specific
 * patterns (e.g. "chicken breast") win over shorter ones ("chicken").
 */

export const DIETS = [
  { id: "vegetarian", label: "Vegetarian", emoji: "🥗" },
  { id: "vegan", label: "Vegan", emoji: "🌱" },
  { id: "gluten-free", label: "Gluten-Free", emoji: "🌾" },
  { id: "dairy-free", label: "Dairy-Free", emoji: "🥛" },
  { id: "low-carb", label: "Low-Carb", emoji: "🥩" },
];

const SUBSTITUTIONS = {
  vegetarian: {
    // Meat → plant-based
    "beef mince": "lentils",
    "ground beef": "lentils",
    "minced beef": "lentils",
    "lamb mince": "chickpeas",
    "ground lamb": "chickpeas",
    "chicken breast": "firm tofu",
    "chicken thigh": "firm tofu",
    "chicken leg": "jackfruit",
    "whole chicken": "cauliflower",
    chicken: "firm tofu",
    turkey: "tempeh",
    duck: "portobello mushroom",
    "pork belly": "jackfruit",
    "pork chop": "cauliflower steak",
    "pork loin": "jackfruit",
    bacon: "smoked tempeh",
    ham: "smoked tofu",
    pork: "jackfruit",
    prosciutto: "sun-dried tomatoes",
    salami: "marinated mushrooms",
    sausage: "vegetarian sausage",
    anchovy: "capers",
    anchovies: "capers",
    tuna: "canned chickpeas",
    salmon: "firm tofu",
    shrimp: "king oyster mushrooms",
    prawns: "king oyster mushrooms",
    fish: "tofu",
    "fish sauce": "soy sauce",
    "worcestershire sauce": "vegetarian worcestershire sauce",
    gelatin: "agar-agar",
    lard: "vegetable shortening",
    suet: "vegetable suet",
  },
  vegan: {
    // Everything from vegetarian +
    "beef mince": "lentils",
    "ground beef": "lentils",
    "minced beef": "lentils",
    "chicken breast": "firm tofu",
    "chicken thigh": "firm tofu",
    chicken: "firm tofu",
    bacon: "smoked tempeh",
    pork: "jackfruit",
    turkey: "tempeh",
    anchovy: "capers",
    "fish sauce": "soy sauce",
    tuna: "canned chickpeas",
    salmon: "firm tofu",
    shrimp: "king oyster mushrooms",
    prawns: "king oyster mushrooms",
    fish: "tofu",
    gelatin: "agar-agar",
    lard: "coconut oil",
    suet: "vegetable suet",
    // Dairy → plant-based
    "heavy cream": "coconut cream",
    "double cream": "coconut cream",
    "whipping cream": "coconut cream",
    "sour cream": "cashew cream",
    "cream cheese": "cashew cream cheese",
    "whole milk": "oat milk",
    "skimmed milk": "oat milk",
    milk: "oat milk",
    buttermilk: "oat milk with 1 tbsp vinegar",
    butter: "vegan butter",
    ghee: "coconut oil",
    "cheddar cheese": "vegan cheddar",
    "parmesan cheese": "nutritional yeast",
    parmesan: "nutritional yeast",
    mozzarella: "vegan mozzarella",
    "feta cheese": "marinated tofu",
    feta: "marinated tofu",
    brie: "cashew brie",
    cheese: "vegan cheese",
    yogurt: "coconut yogurt",
    yoghurt: "coconut yogurt",
    "crème fraîche": "coconut cream",
    custard: "coconut custard",
    // Eggs
    "2 eggs": "2 flax eggs (2 tbsp ground flax + 6 tbsp water)",
    "1 egg": "1 flax egg (1 tbsp ground flax + 3 tbsp water)",
    eggs: "flax eggs",
    egg: "flax egg",
    // Honey
    honey: "maple syrup",
    // Gelatin
    gelatin: "agar-agar",
    "mayonnaise": "vegan mayonnaise",
    mayo: "vegan mayo",
    "worcestershire sauce": "vegan worcestershire sauce",
  },
  "gluten-free": {
    // Flour & grains
    "plain flour": "gluten-free flour blend",
    "all-purpose flour": "gluten-free flour blend",
    "bread flour": "gluten-free bread flour",
    "self-raising flour": "gluten-free self-raising flour",
    "whole wheat flour": "buckwheat flour",
    flour: "gluten-free flour blend",
    breadcrumbs: "gluten-free breadcrumbs",
    "panko breadcrumbs": "gluten-free breadcrumbs",
    panko: "gluten-free breadcrumbs",
    "pasta": "gluten-free pasta",
    "spaghetti": "gluten-free spaghetti",
    "penne": "gluten-free penne",
    "lasagne sheets": "gluten-free lasagne sheets",
    noodles: "rice noodles",
    "egg noodles": "rice noodles",
    "udon noodles": "rice noodles",
    couscous: "quinoa",
    bulgur: "quinoa",
    "semolina": "polenta",
    // Bread
    bread: "gluten-free bread",
    "baguette": "gluten-free baguette",
    "pitta bread": "gluten-free pitta",
    wraps: "corn tortillas",
    tortillas: "corn tortillas",
    // Sauces & condiments
    "soy sauce": "tamari",
    "teriyaki sauce": "gluten-free teriyaki sauce",
    "hoisin sauce": "gluten-free hoisin sauce",
    "oyster sauce": "gluten-free oyster sauce",
    "worcestershire sauce": "gluten-free worcestershire sauce",
    // Oats
    oats: "certified gluten-free oats",
    oatmeal: "certified gluten-free oatmeal",
    // Beer
    beer: "gluten-free beer or apple cider",
    // Barley
    barley: "buckwheat",
    rye: "buckwheat",
    // Baking powder
    "baking powder": "gluten-free baking powder",
  },
  "dairy-free": {
    "heavy cream": "coconut cream",
    "double cream": "coconut cream",
    "whipping cream": "coconut cream",
    "sour cream": "coconut yogurt",
    "cream cheese": "dairy-free cream cheese",
    "whole milk": "oat milk",
    "skimmed milk": "oat milk",
    milk: "oat milk",
    buttermilk: "oat milk with 1 tbsp vinegar",
    butter: "dairy-free butter",
    ghee: "coconut oil",
    "cheddar cheese": "dairy-free cheddar",
    "parmesan cheese": "dairy-free parmesan",
    parmesan: "nutritional yeast",
    mozzarella: "dairy-free mozzarella",
    "feta cheese": "dairy-free feta",
    feta: "dairy-free feta",
    cheese: "dairy-free cheese",
    yogurt: "coconut yogurt",
    yoghurt: "coconut yogurt",
    "crème fraîche": "coconut cream",
    custard: "dairy-free custard",
    "ice cream": "dairy-free ice cream",
    "condensed milk": "coconut condensed milk",
    "evaporated milk": "coconut evaporated milk",
    "mayonnaise": "dairy-free mayonnaise",
    "cream of mushroom soup": "dairy-free mushroom soup",
    "white chocolate": "dairy-free white chocolate",
    "milk chocolate": "dairy-free chocolate",
    chocolate: "dark chocolate (70%+)",
  },
  "low-carb": {
    // Starchy carbs → low-carb alternatives
    pasta: "zucchini noodles (courgetti)",
    spaghetti: "zucchini noodles (courgetti)",
    penne: "low-carb pasta",
    noodles: "shirataki noodles",
    rice: "cauliflower rice",
    "white rice": "cauliflower rice",
    "brown rice": "cauliflower rice",
    "basmati rice": "cauliflower rice",
    couscous: "cauliflower couscous",
    bread: "lettuce leaves",
    "sandwich bread": "low-carb bread",
    "burger bun": "lettuce wrap",
    wraps: "lettuce wraps",
    tortillas: "low-carb tortillas",
    "plain flour": "almond flour",
    "all-purpose flour": "almond flour",
    flour: "almond flour",
    breadcrumbs: "crushed pork rinds or almond flour",
    panko: "crushed pork rinds",
    potato: "cauliflower",
    potatoes: "cauliflower",
    "sweet potato": "butternut squash",
    "sweet potatoes": "butternut squash",
    chips: "baked celeriac chips",
    "french fries": "baked celeriac chips",
    "mashed potato": "cauliflower mash",
    "baked potato": "baked cauliflower",
    oats: "flaxseed meal",
    oatmeal: "flaxseed porridge",
    cornstarch: "xanthan gum (use ¼ the amount)",
    "corn starch": "xanthan gum (use ¼ the amount)",
    "maple syrup": "sugar-free maple syrup",
    honey: "monk fruit sweetener",
    sugar: "erythritol or stevia",
    "caster sugar": "erythritol",
    "brown sugar": "brown erythritol",
    "icing sugar": "powdered erythritol",
    "condensed milk": "sugar-free condensed milk",
    // Fruit-heavy
    banana: "avocado (in baking)",
    raisins: "chopped pecans",
    "dried fruit": "mixed nuts",
    // Beans (moderately low carb - suggest in context)
    corn: "broccoli florets",
    "sweetcorn": "broccoli florets",
    "baked beans": "black soy beans",
    // Beer
    beer: "dry white wine or stock",
    // Milk
    milk: "unsweetened almond milk",
    "whole milk": "unsweetened almond milk",
  },
};

/**
 * Find all substitutions for a given diet in a list of ingredients.
 * Returns an array of { original, replacement, ingredientIndex } objects.
 * An ingredient may have at most one substitution.
 */
export function findSubstitutions(ingredients, dietId) {
  const map = SUBSTITUTIONS[dietId];
  if (!map) return [];

  // Sort patterns longest-first so more specific matches win
  const patterns = Object.keys(map).sort((a, b) => b.length - a.length);

  return ingredients
    .map((ing, index) => {
      const lower = ing.toLowerCase();
      const matched = patterns.find((p) => lower.includes(p));
      if (!matched) return null;
      return {
        original: ing,
        replacement: map[matched],
        ingredientIndex: index,
        matchedPattern: matched,
      };
    })
    .filter(Boolean);
}
