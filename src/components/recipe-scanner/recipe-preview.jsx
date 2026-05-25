import { DatabaseIcon, ImageIcon } from "lucide-react";

export function RecipePreview({ recipe, source }) {
  return (
    <div className="border rounded-lg overflow-hidden bg-card flex flex-col gap-0">
      {/* Hero image */}
      {recipe.image ? (
        <img
          src={recipe.image}
          alt={recipe.name}
          className="w-full h-36 object-cover"
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
      ) : (
        <div className="w-full h-20 bg-muted/40 flex items-center justify-center gap-2 text-muted-foreground">
          <ImageIcon size={18} />
          <span className="text-xs">No image found</span>
        </div>
      )}

      <div className="p-4 flex flex-col gap-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-base leading-snug">
              {recipe.name || "Untitled Recipe"}
            </p>
            {source === "json-ld" && (
              <span className="shrink-0 flex items-center gap-1 text-[10px] text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                <DatabaseIcon size={9} />
                Structured data
              </span>
            )}
          </div>
          {recipe.summary && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
              {recipe.summary}
            </p>
          )}
        </div>

        {/* Meta pills */}
        <div className="flex flex-wrap gap-2">
          {recipe.calories > 0 && (
            <span className="text-xs bg-muted/60 rounded-full px-2.5 py-0.5">
              🔥 {recipe.calories} kcal
            </span>
          )}
          {recipe.servings > 0 && (
            <span className="text-xs bg-muted/60 rounded-full px-2.5 py-0.5">
              👥 {recipe.servings} serv.
            </span>
          )}
          {recipe.prepTime > 0 && (
            <span className="text-xs bg-muted/60 rounded-full px-2.5 py-0.5">
              ⏱ {recipe.prepTime} min
            </span>
          )}
          {recipe.ingredients?.length > 0 && (
            <span className="text-xs bg-muted/60 rounded-full px-2.5 py-0.5">
              🧂 {recipe.ingredients.length} ingredients
            </span>
          )}
          {recipe.steps?.length > 0 && (
            <span className="text-xs bg-muted/60 rounded-full px-2.5 py-0.5">
              📋 {recipe.steps.length} steps
            </span>
          )}
        </div>

        {/* Ingredient list (first 6) */}
        {recipe.ingredients?.length > 0 && (
          <div>
            <p className="text-xs font-semibold mb-1.5 text-muted-foreground uppercase tracking-wide">
              Ingredients
            </p>
            <ul className="text-xs text-muted-foreground flex flex-col gap-0.5">
              {recipe.ingredients.slice(0, 6).map((ing, i) => (
                <li key={i} className="flex gap-1.5">
                  <span className="text-primary/60 shrink-0">·</span>
                  {ing}
                </li>
              ))}
              {recipe.ingredients.length > 6 && (
                <li className="italic text-muted-foreground/60 mt-0.5">
                  + {recipe.ingredients.length - 6} more
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Steps (first 3) */}
        {recipe.steps?.length > 0 && (
          <div>
            <p className="text-xs font-semibold mb-1.5 text-muted-foreground uppercase tracking-wide">
              Steps
            </p>
            <ol className="text-xs text-muted-foreground flex flex-col gap-1">
              {recipe.steps.slice(0, 3).map((step, i) => (
                <li key={step.id} className="flex gap-2">
                  <span className="shrink-0 font-semibold text-primary/70 w-4">{i + 1}.</span>
                  <span className="line-clamp-1">{step.action}</span>
                  {step.duration && (
                    <span className="shrink-0 text-muted-foreground/60">{step.duration}m</span>
                  )}
                </li>
              ))}
              {recipe.steps.length > 3 && (
                <li className="italic text-muted-foreground/60 mt-0.5 pl-6">
                  + {recipe.steps.length - 3} more steps
                </li>
              )}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
