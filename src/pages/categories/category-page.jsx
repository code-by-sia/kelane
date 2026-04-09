import { RecipeViewer } from "@/components/recipe";
import { RecipeList } from "@/components/recipe-list";
import { Button } from "@/components/ui/button";
import SidebarPage from "@/pages/sidebar-page";
import { PlusCircleIcon, SearchIcon } from "lucide-react";
import { useEffect } from "react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";

export default function CategoryPage({ id, recipes = [] }) {
  const { recipeId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const go = useNavigate();

  return (
    <SidebarPage
      title={
        <div className="flex flex-col gap-0 justify-center">
          <span className="text-sm -my-1">{id}</span>
          <small className="text-xs text-muted-foreground">
            {recipes.length} recipes
          </small>
        </div>
      }
      header={
        <div>
          <Button variant="ghost">
            <SearchIcon />
          </Button>
          <Button variant="ghost">
            <PlusCircleIcon />
          </Button>
        </div>
      }
    >
      <div className="flex divide-x h-full">
        <RecipeList
          recipes={recipes}
          onSelect={(code) => go(`/categories/${id}/${code}`)}
        />
        <RecipeViewer recipeId={recipeId} />
      </div>
    </SidebarPage>
  );
}
