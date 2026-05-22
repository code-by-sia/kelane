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
import { ChefHatIcon, CookingPotIcon, SquareTerminal } from "lucide-react";
import { NavCategories } from "./nav-categories";
import { NavFeeds } from "./nav-feeds";
import { SearchTrigger } from "./recipe-search";

const data = {
  user: {
    name: "Samal",
    email: "me@siamand.cc",
    avatar: "/avatars/sia.jpg",
  },

  categories: ["Bakerei", "Fisch", "Pasta", "Vegan"],
  feeds: [
    {
      url: "https://www.bbcgoodfood.com/",
      title: "BCC Good Food",
    },
  ],
};

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <ChefHatIcon className="!size-6" />
      <a href="/">
        <span className="flex flex-col gap-0">
          <strong className="text-base font-semibold -my-1">Kelane</strong>
          <small className="text-muted-foreground">Recipes</small>
        </span>
      </a>
    </div>
  );
}

export function AppSidebar({ ...props }) {
  return (
    <Sidebar collapsible="offcanvas" {...props} className="side-bar">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Logo />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <div className="px-2 pt-1">
          <SearchTrigger />
        </div>
        <NavCategories />
        <NavFeeds items={data.feeds} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
