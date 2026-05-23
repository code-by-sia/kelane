import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { FlagIcon, HeartIcon } from "lucide-react";
import { RecipeViewer } from "@/components/recipe";
import { RecipeList } from "@/components/recipe-list";
import SidebarPage from "@/pages/sidebar-page";
import useRecipeStore from "@/store/recipe";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "favorites", label: "Favorites", icon: HeartIcon },
  { id: "want-to-cook", label: "Want to Cook", icon: FlagIcon },
];

export function MyRecipesPage() {
  const [filter, setFilter] = useState("all");
  const { recipeId } = useParams();
  const go = useNavigate();

  const getFavoriteRecipes = useRecipeStore((s) => s.getFavoriteRecipes);
  const getFlaggedRecipes = useRecipeStore((s) => s.getFlaggedRecipes);

  const recipes = useMemo(() => {
    const favs = getFavoriteRecipes();
    const flagged = getFlaggedRecipes();
    if (filter === "favorites") return favs;
    if (filter === "want-to-cook") return flagged;
    // "all" → union, favorites first
    const seen = new Set(favs.map((r) => r.code));
    return [...favs, ...flagged.filter((r) => !seen.has(r.code))];
  }, [filter, getFavoriteRecipes, getFlaggedRecipes]);

  return (
    <SidebarPage
      title={
        <div className="flex flex-col gap-0 justify-center">
          <span className="text-sm -my-1">My Recipes</span>
          <small className="text-xs text-muted-foreground">
            {recipes.length} recipe{recipes.length !== 1 ? "s" : ""}
          </small>
        </div>
      }
      header={
        <div className="flex items-center gap-1">
          {FILTERS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                filter === id
                  ? "bg-foreground text-background"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              }`}
            >
              {Icon && <Icon size={11} />}
              {label}
            </button>
          ))}
        </div>
      }
    >
      <div className="flex divide-x h-full">
        <RecipeList
          recipes={recipes}
          onSelect={(code) => go(`/my-recipes/${code}`)}
        />
        <RecipeViewer recipeId={recipeId} />
      </div>
    </SidebarPage>
  );
}
