import { useState } from "react";
import SidebarPage from "../sidebar-page";
import {
  Columns3Icon,
  FolderIcon,
  GalleryThumbnailsIcon,
  LayoutGridIcon,
  LayoutListIcon,
  PlusIcon,
  Settings2Icon,
} from "lucide-react";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import useRecipeStore from "@/store/recipe";
import { RecipeFormDialog } from "@/components/recipe-form";
import { CategoryManagerDialog } from "@/components/category-manager";

const GALLERY_COLORS = [
  "bg-yellow-100 border-yellow-200",
  "bg-blue-100 border-blue-200",
  "bg-green-100 border-green-200",
  "bg-purple-100 border-purple-200",
  "bg-pink-100 border-pink-200",
  "bg-orange-100 border-orange-200",
];

export function CategoryFolder({ name, recipes = 0 }) {
  return (
    <a
      href={`/categories/${name}`}
      className="flex items-center gap-2 cursor-pointer min-w-1/5"
    >
      <FolderIcon
        fill="var(--color-yellow-200)"
        stroke="var(--color-yellow-600)"
        size="64"
        strokeWidth={0.4}
      />
      <div className="flex flex-col">
        <span>{name}</span>
        <small>{recipes || "No "} recipes</small>
      </div>
    </a>
  );
}

function CategoryListRow({ name, recipes = 0 }) {
  return (
    <a
      href={`/categories/${name}`}
      className="flex items-center gap-3 px-6 py-3 hover:bg-accent transition-colors border-b last:border-b-0"
    >
      <FolderIcon
        fill="var(--color-yellow-200)"
        stroke="var(--color-yellow-600)"
        size="20"
        strokeWidth={0.6}
      />
      <span className="flex-1 text-sm font-medium">{name}</span>
      <span className="text-xs text-muted-foreground">{recipes || 0} recipes</span>
    </a>
  );
}

function CategoryGalleryCard({ name, recipes = 0, colorClass }) {
  return (
    <a
      href={`/categories/${name}`}
      className={`flex flex-col rounded-xl border overflow-hidden hover:shadow-md transition-shadow ${colorClass}`}
    >
      <div className="h-24 flex items-center justify-center">
        <FolderIcon
          fill="var(--color-yellow-200)"
          stroke="var(--color-yellow-600)"
          size="52"
          strokeWidth={0.4}
        />
      </div>
      <div className="bg-background px-4 py-3 border-t">
        <p className="font-medium text-sm">{name}</p>
        <p className="text-xs text-muted-foreground">{recipes || 0} recipes</p>
      </div>
    </a>
  );
}

const VIEWS = [
  { id: "grid", icon: LayoutGridIcon },
  { id: "list", icon: LayoutListIcon },
  { id: "columns", icon: Columns3Icon },
  { id: "gallery", icon: GalleryThumbnailsIcon },
];

export default function CategoriesPage() {
  const getCategoriesWithCounts = useRecipeStore(
    (store) => store.getCategoriesWithCounts,
  );
  const categories = getCategoriesWithCounts();

  const [view, setView] = useState(
    () => localStorage.getItem("categories.view") || "grid",
  );
  const [addOpen, setAddOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);

  const changeView = (v) => {
    setView(v);
    localStorage.setItem("categories.view", v);
  };

  return (
    <SidebarPage
      title="Recipes"
      header={
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setAddOpen(true)}>
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
                className={`cursor-pointer ${view === id ? "bg-gray-600 text-white hover:bg-gray-700 hover:text-white" : ""}`}
                onClick={() => changeView(id)}
              >
                <Icon />
              </Button>
            ))}
          </ButtonGroup>
        </div>
      }
    >
      <RecipeFormDialog open={addOpen} onOpenChange={setAddOpen} />
      <CategoryManagerDialog open={manageOpen} onOpenChange={setManageOpen} />
      {view === "grid" && (
        <div className="p-6 gap-6 flex flex-wrap">
          {categories.map(({ name, recipes }) => (
            <CategoryFolder key={name} name={name} recipes={recipes} />
          ))}
        </div>
      )}

      {view === "list" && (
        <div className="divide-y">
          {categories.map(({ name, recipes }) => (
            <CategoryListRow key={name} name={name} recipes={recipes} />
          ))}
        </div>
      )}

      {view === "columns" && (
        <div className="p-6 grid grid-cols-3 gap-4">
          {categories.map(({ name, recipes }) => (
            <CategoryFolder key={name} name={name} recipes={recipes} />
          ))}
        </div>
      )}

      {view === "gallery" && (
        <div className="p-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map(({ name, recipes }, i) => (
            <CategoryGalleryCard
              key={name}
              name={name}
              recipes={recipes}
              colorClass={GALLERY_COLORS[i % GALLERY_COLORS.length]}
            />
          ))}
        </div>
      )}
    </SidebarPage>
  );
}
