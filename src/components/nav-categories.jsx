"use client";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useLocation } from "react-router";
import {
  BookHeartIcon,
  CompassIcon,
  HistoryIcon,
  ScanTextIcon,
  TagIcon,
} from "lucide-react";
import { useState } from "react";
import { RecipeScanner } from "@/components/recipe-scanner";
import "./nav-categories.css";

export function NavCategories() {
  const { pathname } = useLocation();
  const [scannerOpen, setScannerOpen] = useState(false);

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel className="nav-group-label group-data-[collapsible=icon]:hidden">Recipes</SidebarGroupLabel>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Explore" isActive={pathname === "/"}>
              <a href="/"><CompassIcon /><span>Explore</span></a>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Categories" isActive={pathname === "/categories"}>
              <a href="/categories"><TagIcon /><span>Categories</span></a>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="My Recipes" isActive={pathname.startsWith("/my-recipes")}>
              <a href="/my-recipes"><BookHeartIcon /><span>My Recipes</span></a>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Cooking History" isActive={pathname === "/history"}>
              <a href="/history"><HistoryIcon /><span>Cooking History</span></a>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Scan Recipe" onClick={() => setScannerOpen(true)}>
              <ScanTextIcon /><span>Scan Recipe</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      <RecipeScanner open={scannerOpen} onClose={() => setScannerOpen(false)} />
    </>
  );
}
