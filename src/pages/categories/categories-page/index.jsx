import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import SidebarPage from "@/pages/sidebar-page";
import "./categories-page.css";
import {
  GalleryThumbnailsIcon,
  LayoutGridIcon,
  LayoutListIcon,
  PlusIcon,
  Settings2Icon,
} from "lucide-react";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import useRecipeStore from "@/store/recipe";
import { CategoryManagerDialog } from "@/components/category-manager";
import { CategoryMosaicCard } from "./category-mosaic-card";
import { CategoryListRow } from "./category-list-row";
import { CategoryGalleryCard } from "./category-gallery-card";

const VIEWS = [
  { id: "grid",    icon: LayoutGridIcon },
  { id: "list",    icon: LayoutListIcon },
  { id: "gallery", icon: GalleryThumbnailsIcon },
];

export default function CategoriesPage() {
  const navigate = useNavigate();
  const categories = useRecipeStore((s) => s.categories);
  const recipes = useRecipeStore((s) => s.recipes);
  const getUncategorizedRecipes = useRecipeStore((s) => s.getUncategorizedRecipes);

  const categoriesWithDetails = useMemo(
    () =>
      categories.map((name) => {
        const catRecipes = recipes.filter((r) => r.categories.includes(name));
        return {
          name,
          count: catRecipes.length,
          images: catRecipes.map((r) => r.image).filter(Boolean).slice(0, 4),
        };
      }),
    [categories, recipes],
  );

  const uncategorizedEntry = useMemo(() => {
    const uncatRecipes = getUncategorizedRecipes();
    return {
      name: "Uncategorized",
      count: uncatRecipes.length,
      images: uncatRecipes.map((r) => r.image).filter(Boolean).slice(0, 4),
      isSpecial: true,
    };
  }, [getUncategorizedRecipes]);

  const [view, setView] = useState(() => {
    const saved = localStorage.getItem("categories.view");
    return saved && saved !== "columns" ? saved : "grid";
  });
  const [manageOpen, setManageOpen] = useState(false);

  const changeView = (v) => {
    setView(v);
    localStorage.setItem("categories.view", v);
  };

  const allCategories = [...categoriesWithDetails, uncategorizedEntry];

  return (
    <SidebarPage
      title="Categories"
      header={
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => navigate("/recipe/new")}>
            <PlusIcon size={14} /> Add Recipe
          </Button>
          <Button size="sm" variant="outline" onClick={() => setManageOpen(true)}>
            <Settings2Icon size={14} /> Categories
          </Button>
          <ButtonGroup>
            {VIEWS.map(({ id, icon: Icon }) => (
              <Button
                key={id}
                variant="outline"
                size="sm"
                className={`cursor-pointer ${view === id ? "view-btn--active" : ""}`}
                onClick={() => changeView(id)}
              >
                <Icon />
              </Button>
            ))}
          </ButtonGroup>
        </div>
      }
    >
      <CategoryManagerDialog open={manageOpen} onOpenChange={setManageOpen} />

      {view === "grid" && (
        <div className="p-6 grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {allCategories.map((cat) => <CategoryMosaicCard key={cat.name} {...cat} />)}
        </div>
      )}

      {view === "list" && (
        <div className="divide-y">
          {allCategories.map((cat) => <CategoryListRow key={cat.name} {...cat} />)}
        </div>
      )}

      {view === "gallery" && (
        <div className="p-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {allCategories.map((cat) => <CategoryGalleryCard key={cat.name} {...cat} />)}
        </div>
      )}
    </SidebarPage>
  );
}
