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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "sonner";
import useFeedsStore from "@/store/feeds";
import "./nav-feeds.css";

function AddFeedInline({ onDone }) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const addFeed = useFeedsStore((s) => s.addFeed);
  const navigate = useNavigate();

  const handleAdd = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    const id = crypto.randomUUID();
    addFeed({ id, url: trimmed, title: title.trim() || trimmed });
    onDone();
    navigate(`/feeds/${id}`);
    toast.success("Feed added");
  };

  return (
    <div className="feeds-add-form">
      <Input
        placeholder="Feed URL…"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        className="h-7 text-xs"
        autoFocus
      />
      <Input
        placeholder="Title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="h-7 text-xs"
      />
      <div className="feeds-add-form__actions">
        <Button size="sm" className="flex-1 h-7 text-xs" disabled={!url.trim()} onClick={handleAdd}>
          Add
        </Button>
        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

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
        {/* ── RSS Feeds: direct link (icon mode) or collapsible (expanded) ── */}
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
