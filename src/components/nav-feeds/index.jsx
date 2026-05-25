"use client";

import { useState, useCallback } from "react";

const FEEDS_OPEN_KEY = "sidebar.feeds.open";
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
import { useLocation, useNavigate } from "react-router";
import {
  BookMarkedIcon,
  CalendarDaysIcon,
  ChevronRight,
  PlusIcon,
  RssIcon,
  ShoppingBagIcon,
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import useFeedsStore from "@/store/feeds";
import "./nav-feeds.css";
import { AddFeedInline } from "./add-feed-inline";

export function NavFeeds() {
  const { isMobile, state } = useSidebar();
  const { pathname } = useLocation();
  const isCollapsed = state === "collapsed";

  const feeds = useFeedsStore((s) => s.feeds);
  const removeFeed = useFeedsStore((s) => s.removeFeed);

  const [addingFeed, setAddingFeed] = useState(false);
  const [feedsOpen, setFeedsOpen] = useState(
    () => localStorage.getItem(FEEDS_OPEN_KEY) === "true",
  );

  const toggleFeeds = useCallback((v) => {
    setFeedsOpen(v);
    localStorage.setItem(FEEDS_OPEN_KEY, String(v));
  }, []);

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="nav-group-label group-data-[collapsible=icon]:hidden">
        Feeds &amp; Tools
      </SidebarGroupLabel>


      <SidebarMenu>
        {isCollapsed ? (
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Feeds" isActive={pathname.startsWith("/feeds")}>
              <a href="/feeds"><RssIcon /><span>Feeds</span></a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ) : (
          <Collapsible asChild open={feedsOpen} onOpenChange={toggleFeeds} className="group/collapsible">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip="Feeds">
                  <RssIcon />
                  <span>Feeds</span>
                  <ChevronRight className="feeds-chevron" />
                </SidebarMenuButton>
              </CollapsibleTrigger>

              <SidebarMenuAction title="Add feed" onClick={() => setAddingFeed((v) => !v)}>
                <PlusIcon size={14} />
              </SidebarMenuAction>

              <CollapsibleContent>
                <SidebarMenuSub className="border-none">
                  {feeds.map((feed) => (
                    <SidebarMenuSubItem key={feed.id}>
                      <SidebarMenuSubButton asChild isActive={pathname === `/feeds/${feed.id}`}>
                        <a href={`/feeds/${feed.id}`}>
                          <BookMarkedIcon size={13} />
                          <span>{feed.title}</span>
                        </a>
                      </SidebarMenuSubButton>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <SidebarMenuAction showOnHover className="data-[state=open]:bg-accent rounded-sm">
                            <IconDots size={14} />
                            <span className="sr-only">More</span>
                          </SidebarMenuAction>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          className="w-fit rounded-lg"
                          side={isMobile ? "bottom" : "right"}
                          align={isMobile ? "end" : "start"}
                        >
                          <DropdownMenuItem variant="destructive" onClick={() => removeFeed(feed.id)}>
                            <IconTrash size={14} />
                            <span>Remove Feed</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </SidebarMenuSubItem>
                  ))}

                  {feeds.length === 0 && (
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton className="feeds-empty-hint" onClick={() => setAddingFeed(true)}>
                        No feeds — click + to add
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  )}
                </SidebarMenuSub>

                {addingFeed && <AddFeedInline onDone={() => setAddingFeed(false)} />}
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        )}

        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Calendar" isActive={pathname === "/calendar"}>
            <a href="/calendar"><CalendarDaysIcon /><span>Calendar</span></a>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Groceries" isActive={pathname === "/groceries"}>
            <a href="/groceries"><ShoppingBagIcon /><span>Groceries</span></a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
