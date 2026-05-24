"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavCategories } from "@/components/nav-categories";
import { NavFeeds } from "@/components/nav-feeds";
import { NavUser } from "@/components/nav-user";
import { SearchTrigger } from "@/components/recipe-search";
import { Logo } from "./logo";
import "./app-sidebar.css";

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
