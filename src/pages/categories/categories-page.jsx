import { useCategoryManager } from "@/hooks/category";
import SidebarPage from "../sidebar-page";
import Repeat from "@/components/repeat";
import {
  Columns3Icon,
  FolderIcon,
  GalleryThumbnailsIcon,
  LayoutGridIcon,
  LayoutListIcon,
} from "lucide-react";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";

export function CategoryFolder({ name }) {
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
        <small>12 recipes</small>
      </div>
    </a>
  );
}

export default function CategoriesPage() {
  const { categories } = useCategoryManager();
  return (
    <SidebarPage
      title="Recipes"
      header={
        <div>
          <ButtonGroup>
            <Button
              variant="outline"
              className="bg-gray-600 text-white"
              size="sm"
            >
              <LayoutGridIcon />
            </Button>
            <Button variant="outline" size="sm" className="cursor-pointer">
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
      <div className="p-6 gap-6 flex flex-wrap">
        <Repeat
          value={categories.map((it) => ({ code: it, name: it }))}
          view={CategoryFolder}
        />
      </div>
    </SidebarPage>
  );
}
