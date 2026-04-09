"use client";

import {
  IconDots,
  IconFolder,
  IconPackageExport,
  IconShare3,
  IconTrash,
} from "@tabler/icons-react";
import { DynamicIcon } from "lucide-react/dynamic";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useLocation } from "react-router";
import {
  ArchiveIcon,
  BookmarkXIcon,
  ChevronRight,
  Clock9Icon,
  EllipsisIcon,
  FlagIcon,
  HeartIcon,
  ShareIcon,
  TagIcon,
  TimerIcon,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { useCategoryManager } from "@/hooks/category";

export function NavCategories() {
  const { isMobile } = useSidebar();
  const { pathname } = useLocation();

  const { categories } = useCategoryManager();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Recipes</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={pathname === `/categories`}>
            <a href="/categories">
              <TagIcon />
              <span>Categories</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={pathname === `/most-recent`}>
            <a href="/most-recent">
              <Clock9Icon />
              <span>Most Recent</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={pathname === `/want-to-cook`}>
            <a href="/want-to-cook">
              <FlagIcon />
              <span>Want to Cook</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={pathname === `/favorites`}>
            <a href="/favorites">
              <HeartIcon />
              <span>Favorites</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={pathname === `/uncategorized`}>
            <a href="/uncategorized">
              <BookmarkXIcon />
              <span>Uncategorized</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
