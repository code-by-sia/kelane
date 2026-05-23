import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { Clock9Icon, FlagIcon, HeartIcon } from "lucide-react";
import { RecipeViewer } from "@/components/recipe";
import { RecipeList } from "@/components/recipe-list";
import SidebarPage from "@/pages/sidebar-page";
import useRecipeStore from "@/store/recipe";

const A_WEEK = 7 * 24 * 60 * 60 * 1000;

const FILTERS = [
  { id: "all", label: "All" },
  { id: "favorites", label: "Favorites", icon: HeartIcon },
  { id: "want-to-cook", label: "Want to Cook", icon: FlagIcon },
  { id: "recent", label: "Most Recent", icon: Clock9Icon },
];

export function MyRecipesPage() {
  const [filter, setFilter] = useState("all");
  const { recipeId } = useParams();
  const go = useNavigate();

  const recipes = useRecipeStore((s) => s.recipes);
  const getFavoriteRecipes = useRecipeStore((s) => s.getFavoriteRecipes);
  const getFlaggedRecipes = useRecipeStore((s) => s.getFlaggedRecipes);

  const filtered = useMemo(() => {
    if (filter === "favorites") return getFavoriteRecipes();
    if (filter === "want-to-cook") return getFlaggedRecipes();
    if (filter === "recent")
      return [...recipes]
        .filter((r) => r.date && new Date(r.date) > new Date(Date.now() - A_WEEK))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    // "all" → union of favorites + want-to-cook, favorites first
    const favs = getFavoriteRecipes();
    const flagged = getFlaggedRecipes();
    const seen = new Set(favs.map((r) => r.code));
    return [...favs, ...flagged.filter((r) => !seen.has(r.code))];
  }, [filter, recipes, getFavoriteRecipes, getFlaggedRecipes]);

  return (
    <SidebarPage
      title={
        <div className="flex flex-col gap-0 justify-center">
          <span className="text-sm -my-1">My Recipes</span>
          <small className="text-xs text-muted-foreground">
            {filtered.length} recipe{filtered.length !== 1 ? "s" : ""}
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
          recipes={filtered}
          onSelect={(code) => go(`/my-recipes/${code}`)}
        />
        <RecipeViewer recipeId={recipeId} />
      </div>
    </SidebarPage>
  );
}
