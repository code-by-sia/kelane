import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeftIcon, Clock9Icon, FlagIcon, HeartIcon } from "lucide-react";
import { RecipeViewer } from "@/components/recipe";
import { RecipeList } from "@/components/recipe-list";
import SidebarPage from "@/pages/sidebar-page";
import useRecipeStore from "@/store/recipe";
import { Button } from "@/components/ui/button";

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
    // "all" — every recipe, newest first
    return [...recipes].sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date) - new Date(a.date);
    });
  }, [filter, recipes, getFavoriteRecipes, getFlaggedRecipes]);

  const filterBar = (
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
      {FILTERS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setFilter(id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer shrink-0 ${
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
  );

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
      header={filterBar}
    >
      {/* ── Mobile: recipe selected → full-screen detail ── */}
      {recipeId ? (
        <>
          {/* Back button row, mobile only */}
          <div className="md:hidden flex items-center gap-2 px-3 py-2 border-b shrink-0">
            <Button variant="ghost" size="icon-sm" onClick={() => go("/my-recipes")} title="Back">
              <ArrowLeftIcon size={16} />
            </Button>
            <span className="text-sm font-medium text-muted-foreground">My Recipes</span>
          </div>
          <div className="flex divide-x flex-1 min-h-0 overflow-hidden">
            {/* List hidden on mobile when recipe is open */}
            <div className="hidden md:flex">
              <RecipeList recipes={filtered} onSelect={(code) => go(`/my-recipes/${code}`)} />
            </div>
            <div className="flex flex-col flex-1 overflow-y-auto">
              <RecipeViewer recipeId={recipeId} />
            </div>
          </div>
        </>
      ) : (
        /* No recipe selected — list fills full width */
        <div className="flex divide-x flex-1 min-h-0 overflow-hidden">
          <RecipeList recipes={filtered} onSelect={(code) => go(`/my-recipes/${code}`)} />
        </div>
      )}
    </SidebarPage>
  );
}
