import SidebarPage from "../sidebar-page";
import Repeat from "@/components/repeat";
import {
  ChevronRight,
  Columns3Icon,
  GalleryThumbnailsIcon,
  LayoutGridIcon,
  LayoutListIcon,
} from "lucide-react";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import { useParams } from "react-router";
import { RecipeViewer } from "@/components/recipe";
import useRecipeStore from "@/store/recipe";
import { useMemo } from "react";

export function RecipeItem({
  code,
  name,
  summary,
  categories,
  flagged,
  liked,
  calories,
  preperationTime,
  image,
  images,
  ingredients,
  tools,
  date,
  steps,
}) {
  const { id } = useParams();
  return (
    <a
      href={`/categories/${id}/${code}`}
      className="cursor-pointer flex p-2 gap-3 items-start max-w-sm hover:bg-neutral-200 active:bg-neutral-100 active:shadow-lg rounded-xl"
    >
      <img className="size-20 bg-contain rounded-lg object-cover" src={image} />
      <div className="flex flex-col">
        <span>{name}</span>
        <small>{summary}</small>
      </div>
    </a>
  );
}

export default function RecipiesPage() {
  const { id, recipeId } = useParams();
  const getRecipesInCategory = useRecipeStore(
    (store) => store.getRecipesInCategory,
  );
  const recipes = useMemo(
    () => getRecipesInCategory(id),
    [getRecipesInCategory, id],
  );

  return (
    <SidebarPage
      title={
        <div className="flex items-center gap-2">
          <a href="/categories" className="text-gray-500">
            Recipes
          </a>
          <ChevronRight size="14" />
          <a href={`/categories/${id}`}>{id}</a>
        </div>
      }
      header={
        <div>
          <ButtonGroup>
            <Button variant="outline" size="sm" className="cursor-pointer">
              <LayoutGridIcon />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-600 text-white"
            >
              <LayoutListIcon />
            </Button>
            <Button variant="outline" size="sm" className="cursor-pointer">
              <Columns3Icon />
            </Button>
            <Button variant="outline" size="sm" className="cursor-pointer">
              <GalleryThumbnailsIcon />
            </Button>
          </ButtonGroup>
        </div>
      }
    >
      <div className="flex items-start flex-1">
        <div className="p-6 gap-6 flex flex-wrap">
          <Repeat value={recipes} view={RecipeItem} />
        </div>

        {recipeId && (
          <div className="flex border h-full w-1/2">
            <RecipeViewer recipeId={recipeId} />
          </div>
        )}
      </div>
    </SidebarPage>
  );
}
