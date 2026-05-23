/**
 * Open Food Facts integration for ingredient naming and nutrition data.
 *
 * Uses the free, no-key-required Open Food Facts API which follows the
 * EU food-labelling standard (Regulation EU 1169/2011) — per-100 g format,
 * "Salt" instead of Sodium, "Fibre" spelling, kJ alongside kcal, etc.
 *
 * Docs: https://openfoodfacts.github.io/openfoodfacts-server/api/
 */

const OFF = "https://world.openfoodfacts.org";

/**
 * Suggest standardised ingredient names as the user types.
 * Returns up to `limit` name strings (lowercase, capitalised by the UI).
 */
export async function suggestIngredients(query, limit = 7) {
  if (!query || query.trim().length < 2) return [];
  try {
    const url = `${OFF}/cgi/suggest.pl?${new URLSearchParams({
      string: query.trim(),
      lc: "en",
    })}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return [];
    const raw = await res.json(); // string[]
    return raw.slice(0, limit);
  } catch {
    return [];
  }
}

/**
 * Fetch EU-format nutrition data (per 100 g) for an ingredient name.
 * Returns null when no data is found or on network error.
 *
 * @returns {{
 *   productName: string,
 *   energyKj: number|null,
 *   energyKcal: number|null,
 *   fat: number|null,
 *   saturates: number|null,
 *   carbohydrate: number|null,
 *   sugars: number|null,
 *   fibre: number|null,
 *   protein: number|null,
 *   salt: number|null,
 * } | null}
 */
export async function fetchNutrition(name) {
  if (!name || !name.trim()) return null;
  try {
    const url = `${OFF}/api/v2/search?${new URLSearchParams({
      search_terms: name.trim(),
      page_size: "1",
      fields: "product_name,nutriments",
      json: "1",
    })}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(9000) });
    if (!res.ok) return null;
    const data = await res.json();
    const product = data?.products?.[0];
    if (!product) return null;

    const n = product.nutriments ?? {};

    // OFF stores both "energy-kj_100g" and "energy_100g" (kJ); kcal has its own key
    const energyKj =
      n["energy-kj_100g"] ?? n["energy_100g"] ?? null;
    const energyKcal =
      n["energy-kcal_100g"] ??
      (energyKj != null ? Math.round(energyKj / 4.184) : null);

    return {
      productName: product.product_name ?? name,
      energyKj: energyKj != null ? Math.round(energyKj) : null,
      energyKcal: energyKcal != null ? Math.round(energyKcal) : null,
      fat: n["fat_100g"] ?? null,
      saturates: n["saturated-fat_100g"] ?? null,
      carbohydrate: n["carbohydrates_100g"] ?? null,
      sugars: n["sugars_100g"] ?? null,
      fibre: n["fiber_100g"] ?? n["fibre_100g"] ?? null,
      protein: n["proteins_100g"] ?? null,
      salt: n["salt_100g"] ?? null,
    };
  } catch {
    return null;
  }
}
