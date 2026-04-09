"use client";

import { IconDots, IconTrash } from "@tabler/icons-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  BookMarkedIcon,
  CalendarDaysIcon,
  ChevronRight,
  CompassIcon,
  EllipsisIcon,
  LibraryBigIcon,
  ShoppingBagIcon,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";

export function NavFeeds({ items }) {
  const { isMobile } = useSidebar();
  const { pathname } = useLocation();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Feeds</SidebarGroupLabel>
      <SidebarMenu>
        <Collapsible
          key="all"
          asChild
          defaultOpen={true}
          className="group/collapsible"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip="All">
                <LibraryBigIcon />
                <span>Feeds</span>
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub className="border-none">
                {items?.map((feed) => (
                  <SidebarMenuSubItem key={feed.url}>
                    <SidebarMenuSubButton
                      asChild
                      isActive={
                        pathname === `/feeds/${new URLSearchParams(feed.url)}`
                      }
                    >
                      <a href={`/feeds/${new URLSearchParams(feed.url)}`}>
                        <BookMarkedIcon />
                        <span>{feed.title}</span>
                      </a>
                    </SidebarMenuSubButton>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuAction
                          showOnHover
                          className="data-[state=open]:bg-accent rounded-sm"
                        >
                          <IconDots />
                          <span className="sr-only">More</span>
                        </SidebarMenuAction>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="w-fit rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align={isMobile ? "end" : "start"}
                      >
                        <DropdownMenuItem>
                          <EllipsisIcon />
                          <span>Edit Feed</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem variant="destructive">
                          <IconTrash />
                          <span>Delete Feed</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>

        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={pathname === `/browser`}>
            <a href="/browser">
              <CompassIcon />
              <span>Browser</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={pathname === `/calendar`}>
            <a href="/calendar">
              <CalendarDaysIcon />
              <span>Calendar</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={pathname === `/groceries`}>
            <a href="/groceries">
              <ShoppingBagIcon />
              <span>Grocories</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
