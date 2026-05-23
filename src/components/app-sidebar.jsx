"use client";

import * as React from "react";

import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ChefHatIcon } from "lucide-react";
import { NavCategories } from "./nav-categories";
import { NavFeeds } from "./nav-feeds";
import { SearchTrigger } from "./recipe-search";

function Logo() {
  return (
    <div className="flex items-center gap-2 overflow-hidden">
      <ChefHatIcon className="size-5 shrink-0" />
      {/* Hidden when sidebar collapses to icon rail */}
      <div className="group-data-[collapsible=icon]:hidden flex flex-col leading-none">
        <strong className="text-sm font-semibold tracking-tight">Kelane</strong>
        <small className="text-sidebar-foreground/50 text-[10px]">Recipes</small>
      </div>
    </div>
  );
}

export function AppSidebar({ ...props }) {
  return (
    <Sidebar collapsible="icon" {...props} className="side-bar">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Kelane"
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/">
                <Logo />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Search bar — hidden in icon rail mode */}
        <div className="px-0 pt-1 group-data-[collapsible=icon]:hidden">
          <SearchTrigger />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <NavCategories />
        <NavFeeds />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
