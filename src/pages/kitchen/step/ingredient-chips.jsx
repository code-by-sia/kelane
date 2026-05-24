export function IngredientChips({ ingredients }) {
  if (!ingredients?.length) return null;
  return (
    <div className="ing-chips">
      {ingredients.map((ing) => (
        <span key={ing} className="ing-chip">
          {ing}
        </span>
      ))}
    </div>
  );
}
