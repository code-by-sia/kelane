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
  BookHeartIcon,
  ChevronRight,
  Clock9Icon,
  CompassIcon,
  EllipsisIcon,
  HistoryIcon,
  ShareIcon,
  TagIcon,
  TimerIcon,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";

import useRecipeStore from "@/store/recipe";

export function NavCategories() {
  const { isMobile } = useSidebar();
  const { pathname } = useLocation();

  const categories = useRecipeStore((state) => state.categories);

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Recipes</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={pathname === `/`}>
            <a href="/">
              <CompassIcon />
              <span>Explore</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
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
          <SidebarMenuButton
            asChild
            isActive={pathname.startsWith(`/my-recipes`)}
          >
            <a href="/my-recipes">
              <BookHeartIcon />
              <span>My Recipes</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={pathname === `/history`}>
            <a href="/history">
              <HistoryIcon />
              <span>Cooking History</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
