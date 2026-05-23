import { useState, useMemo } from "react";
import SidebarPage from "../sidebar-page";
import "./categories-page.css";
import {
  BookmarkXIcon,
  FolderOpenIcon,
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

// ── Mosaic card (default grid view) ──────────────────────────────────────
function CategoryMosaicCard({ name, count, images, isSpecial = false }) {
  const href = isSpecial ? `/uncategorized` : `/categories/${name}`;
  const imgs = images.slice(0, 4);

  return (
    <a
      href={href}
      className="cat-mosaic group"
    >
      {/* Image mosaic */}
      <div className="cat-mosaic__media">
        {imgs.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center">
            {isSpecial ? (
              <BookmarkXIcon size={40} className="text-muted-foreground/25" />
            ) : (
              <FolderOpenIcon size={40} className="text-muted-foreground/25" />
            )}
          </div>
        ) : imgs.length === 1 ? (
          <img
            src={imgs[0]}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="cat-photo-grid">
            {imgs.map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
              />
            ))}
          </div>
        )}
      </div>

      {/* Label */}
      <div className="cat-mosaic__label">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{name}</p>
          <p className="text-xs text-muted-foreground">
            {count} recipe{count !== 1 ? "s" : ""}
          </p>
        </div>
        {isSpecial && (
          <BookmarkXIcon size={13} className="text-muted-foreground shrink-0" />
        )}
      </div>
    </a>
  );
}

// ── List row ──────────────────────────────────────────────────────────────
function CategoryListRow({ name, count, images, isSpecial = false }) {
  const href = isSpecial ? `/uncategorized` : `/categories/${name}`;
  const imgs = images.slice(0, 4);

  return (
    <a
      href={href}
      className="cat-list-row"
    >
      {/* Stacked avatars or icon */}
      <div className="shrink-0 w-20 flex items-center">
        {imgs.length === 0 ? (
          isSpecial ? (
            <BookmarkXIcon size={20} className="text-muted-foreground" />
          ) : (
            <FolderOpenIcon size={20} className="text-muted-foreground" />
          )
        ) : (
          <div className="cat-list-row__avatars">
            {imgs.map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                className="cat-list-row__avatar"
                style={{ zIndex: imgs.length - i }}
              />
            ))}
          </div>
        )}
      </div>

      <span className="flex-1 text-sm font-medium">{name}</span>

      <span className="text-xs text-muted-foreground tabular-nums shrink-0">
        {count} recipe{count !== 1 ? "s" : ""}
      </span>
    </a>
  );
}

// ── Gallery card (large, image fills with overlay) ────────────────────────
function CategoryGalleryCard({ name, count, images, isSpecial = false }) {
  const href = isSpecial ? `/uncategorized` : `/categories/${name}`;
  const imgs = images.slice(0, 4);

  return (
    <a
      href={href}
      className="cat-gallery group"
    >
      <div className="cat-gallery__media">
        {imgs.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center">
            {isSpecial ? (
              <BookmarkXIcon size={56} className="text-muted-foreground/20" />
            ) : (
              <FolderOpenIcon size={56} className="text-muted-foreground/20" />
            )}
          </div>
        ) : imgs.length === 1 ? (
          <img
            src={imgs[0]}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="cat-photo-grid">
            {imgs.map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
              />
            ))}
          </div>
        )}
        {/* Gradient overlay */}
        <div className="cat-gallery__overlay" />
        {/* Name on image */}
        <div className="cat-gallery__body">
          <p className="font-semibold text-sm leading-tight drop-shadow">{name}</p>
          <p className="text-xs text-white/70">
            {count} recipe{count !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </a>
  );
}

// ── Views ─────────────────────────────────────────────────────────────────
const VIEWS = [
  { id: "grid", icon: LayoutGridIcon },
  { id: "list", icon: LayoutListIcon },
  { id: "gallery", icon: GalleryThumbnailsIcon },
];

// ── Page ──────────────────────────────────────────────────────────────────
export default function CategoriesPage() {
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

  const [view, setView] = useState(
    () => {
      const saved = localStorage.getItem("categories.view");
      // "columns" was removed — fall back to grid
      return saved && saved !== "columns" ? saved : "grid";
    },
  );
  const [addOpen, setAddOpen] = useState(false);
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
      <RecipeFormDialog open={addOpen} onOpenChange={setAddOpen} />
      <CategoryManagerDialog open={manageOpen} onOpenChange={setManageOpen} />

      {view === "grid" && (
        <div className="p-6 grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {allCategories.map((cat) => (
            <CategoryMosaicCard key={cat.name} {...cat} />
          ))}
        </div>
      )}

      {view === "list" && (
        <div className="divide-y">
          {allCategories.map((cat) => (
            <CategoryListRow key={cat.name} {...cat} />
          ))}
        </div>
      )}

      {view === "gallery" && (
        <div className="p-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {allCategories.map((cat) => (
            <CategoryGalleryCard key={cat.name} {...cat} />
          ))}
        </div>
      )}
    </SidebarPage>
  );
}
