"use client";

import { useLocation } from "react-router";
import { ChefHatIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavAssistant() {
  const { pathname } = useLocation();
  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            tooltip="Cooking Assistant"
            isActive={pathname === "/assistant"}
          >
            <a href="/assistant">
              <ChefHatIcon />
              <span>Cooking Assistant</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
