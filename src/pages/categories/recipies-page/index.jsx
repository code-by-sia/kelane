import "./recipies-page.css";
import { ChevronRight, FlameIcon, LayoutGridIcon, LayoutListIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useNavigate, useParams } from "react-router";
import { RecipeViewer } from "@/components/recipe";
import useRecipeStore from "@/store/recipe";
import { useMemo, useState } from "react";
import SidebarPage from "@/pages/sidebar-page";
import { RecipeCard } from "./recipe-card";
import { RecipeItem } from "./recipe-item";

export default function RecipiesPage() {
  const { id, recipeId } = useParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"

  const getRecipesInCategory = useRecipeStore((store) => store.getRecipesInCategory);
  const recipes = useMemo(() => getRecipesInCategory(id), [getRecipesInCategory, id]);

  const listInner = (
    <>
      {viewMode === "grid" ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3 p-4 sm:p-6">
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
    </>
  );

  return (
    <SidebarPage
      title={
        <div className="flex items-center gap-2 text-sm">
          <a
            href="/categories"
            onClick={(e) => { e.preventDefault(); navigate("/categories"); }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
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
      {/* ── Mobile: one panel at a time ───────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-h-0 sm:hidden">
        <div className={`overflow-y-auto flex-1 ${recipeId ? "hidden" : ""}`}>
          {listInner}
        </div>
        {recipeId && (
          <div className="flex flex-col flex-1 overflow-y-auto">
            <RecipeViewer recipeId={recipeId} />
          </div>
        )}
      </div>

      {/* ── Desktop: resizable side-by-side panels ────────────────────────── */}
      <div className="hidden sm:flex flex-1 min-h-0 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={recipeId ? 55 : 100} minSize={25}>
            <div className="overflow-y-auto h-full">
              {listInner}
            </div>
          </ResizablePanel>

          {recipeId && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={45} minSize={20}>
                <div className="flex flex-col border-l h-full overflow-y-auto">
                  <RecipeViewer recipeId={recipeId} />
                </div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </SidebarPage>
  );
}
