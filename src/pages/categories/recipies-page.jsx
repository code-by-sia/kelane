import SidebarPage from "../sidebar-page";
import Repeat from "@/components/repeat";
import {
  ChevronRight,
  ClockIcon,
  FlameIcon,
  HeartIcon,
  LayoutGridIcon,
  LayoutListIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router";
import { RecipeViewer } from "@/components/recipe";
import useRecipeStore from "@/store/recipe";
import { useMemo, useState } from "react";

// ── Full-bleed recipe card (grid view) ────────────────────────────────────
export function RecipeCard({ code, name, summary, calories, preperationTime, image, liked }) {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <a
      href={`/categories/${id}/${code}`}
      onClick={(e) => { e.preventDefault(); navigate(`/categories/${id}/${code}`); }}
      className="group relative rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all duration-200 hover:scale-[1.02] block"
    >
      {/* Image */}
      {image ? (
        <img
          src={image}
          alt={name}
          className="aspect-[4/3] w-full object-cover"
        />
      ) : (
        <div className="aspect-[4/3] w-full bg-gradient-to-br from-primary/8 to-primary/15 flex items-center justify-center">
          <FlameIcon size={40} className="text-primary/40" strokeWidth={1} />
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

      {/* Favourite badge top-right */}
      {liked && (
        <div className="absolute top-2.5 right-2.5">
          <HeartIcon size={16} className="fill-red-500 stroke-red-400" />
        </div>
      )}

      {/* Text on gradient */}
      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
        <p className="font-semibold text-sm leading-tight line-clamp-2">{name}</p>
        <div className="flex items-center gap-3 mt-1">
          {preperationTime && (
            <span className="flex items-center gap-1 text-xs text-white/70">
              <ClockIcon size={11} />
              {preperationTime} min
            </span>
          )}
          {calories && (
            <span className="flex items-center gap-1 text-xs text-white/70">
              <FlameIcon size={11} />
              {calories} kcal
            </span>
          )}
        </div>
      </div>
    </a>
  );
}

// ── Compact list row (list view) ──────────────────────────────────────────
export function RecipeItem({ code, name, summary, calories, preperationTime, image, liked }) {
  const { id } = useParams();
  return (
    <a
      href={`/categories/${id}/${code}`}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-colors cursor-pointer w-full"
    >
      {image ? (
        <img className="w-14 h-14 rounded-lg object-cover shrink-0" src={image} alt={name} />
      ) : (
        <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <FlameIcon size={20} className="text-primary/50" strokeWidth={1} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{name}</p>
        {summary && <p className="text-xs text-muted-foreground truncate mt-0.5">{summary}</p>}
        <div className="flex gap-3 mt-1">
          {preperationTime && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <ClockIcon size={10} /> {preperationTime} min
            </span>
          )}
          {calories && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <FlameIcon size={10} /> {calories} kcal
            </span>
          )}
        </div>
      </div>
      {liked && <HeartIcon size={14} className="fill-red-500 stroke-red-400 shrink-0" />}
    </a>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function RecipiesPage() {
  const { id, recipeId } = useParams();
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"

  const getRecipesInCategory = useRecipeStore((store) => store.getRecipesInCategory);
  const recipes = useMemo(() => getRecipesInCategory(id), [getRecipesInCategory, id]);

  return (
    <SidebarPage
      title={
        <div className="flex items-center gap-2 text-sm">
          <a href="/categories" className="text-muted-foreground hover:text-foreground transition-colors">
            Recipes
          </a>
          <ChevronRight size={14} className="text-muted-foreground" />
          <span className="font-medium">{id}</span>
        </div>
      }
      header={
        <div className="flex items-center gap-1">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon-sm"
            onClick={() => setViewMode("grid")}
            title="Grid view"
          >
            <LayoutGridIcon size={14} />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon-sm"
            onClick={() => setViewMode("list")}
            title="List view"
          >
            <LayoutListIcon size={14} />
          </Button>
        </div>
      }
    >
      <div className="flex items-start flex-1 min-h-0 overflow-hidden">
        {/* Recipe grid/list — hidden on mobile when a recipe is open */}
        <div className={`overflow-y-auto h-full flex-1 ${recipeId ? "hidden sm:block" : "block"}`}>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-4 sm:p-6">
              {recipes.map((r) => <RecipeCard key={r.code} {...r} />)}
            </div>
          ) : (
            <div className="flex flex-col gap-1 p-3 sm:p-4">
              {recipes.map((r) => <RecipeItem key={r.code} {...r} />)}
            </div>
          )}
          {recipes.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground py-20">
              <FlameIcon size={48} strokeWidth={0.6} />
              <p className="text-sm">No recipes in this category yet.</p>
            </div>
          )}
        </div>

        {/* Recipe detail — full-width on mobile, half on desktop */}
        {recipeId && (
          <div className="flex flex-col border-l h-full w-full sm:w-[480px] shrink-0 overflow-y-auto">
            <RecipeViewer recipeId={recipeId} />
          </div>
        )}
      </div>
    </SidebarPage>
  );
}
