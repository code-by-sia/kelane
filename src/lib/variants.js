/**
 * Apply a named variant's overrides on top of a base recipe.
 * Fields absent from the variant (null / undefined / empty array) fall back to
 * the base recipe values, so partial overrides work naturally.
 *
 * @param {object} recipe     - The base recipe object from the store.
 * @param {string} variantId  - The variant id to apply, or null for the base.
 * @returns {object}          - Merged recipe ready for display / cooking.
 */
export function applyVariant(recipe, variantId) {
  if (!variantId || !recipe?.variants?.length) return recipe;
  const v = recipe.variants.find((vr) => vr.id === variantId);
  if (!v) return recipe;

  return {
    ...recipe,
    // Only override fields that the variant explicitly provides
    ...(v.image                ? { image:       v.image       } : {}),
    ...(v.calories    != null  ? { calories:    v.calories    } : {}),
    ...(v.prepTime    != null  ? { prepTime:    v.prepTime    } : {}),
    ...(v.summary              ? { summary:     v.summary     } : {}),
    ...(v.ingredients?.length  ? { ingredients: v.ingredients } : {}),
    ...(v.steps?.length        ? { steps:       v.steps       } : {}),
  };
}

/**
 * Slugify a variant name into a stable id string.
 * e.g. "Vegan Option" → "vegan-option"
 */
export function variantSlug(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
