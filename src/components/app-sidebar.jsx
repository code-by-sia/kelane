"use client";

import * as React from "react";
import { ChefHatIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavCategories } from "./nav-categories";
import { NavFeeds } from "./nav-feeds";
import { NavUser } from "./nav-user";
import { SearchTrigger } from "./recipe-search";
import "./app-sidebar.css";

function Logo() {
  return (
    <div className="sidebar-logo">
      <ChefHatIcon className="sidebar-logo__icon" />
      <div className="sidebar-logo__text">
        <strong className="sidebar-logo__title">Kelane</strong>
        <small className="sidebar-logo__subtitle">Recipes</small>
      </div>
    </div>
  );
}

export function AppSidebar({ ...props }) {
  return (
    <Sidebar collapsible="icon" {...props}>
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

        <div className="sidebar-search">
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
