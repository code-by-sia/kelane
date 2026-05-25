"use client";

import { useLocation } from "react-router";
import { SparklesIcon } from "lucide-react";
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
            tooltip="Assistant"
            isActive={pathname === "/assistant"}
          >
            <a href="/assistant">
              <SparklesIcon />
              <span>Assistant</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
