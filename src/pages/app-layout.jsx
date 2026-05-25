/**
 * Persistent app shell — renders the sidebar once and keeps it alive across
 * all navigations. The lazy-loaded page content goes inside <Outlet> which
 * has its own Suspense boundary so the sidebar never disappears during loading.
 */

import { Suspense } from "react";
import { Outlet, useLocation } from "react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { CookingIcon } from "@/components/loading/cooking-icon";
import { MobileNav } from "@/components/mobile-nav";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

function getSidebarDefault() {
  if (typeof document === "undefined") return true;
  const entry = document.cookie
    .split("; ")
    .find((c) => c.startsWith("sidebar_state="));
  return entry ? entry.split("=")[1] === "true" : true;
}

/** Loading indicator shown inside the content area while a page chunk loads. */
function ContentSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 h-64 text-muted-foreground">
      <CookingIcon size={48} />
      <span className="text-sm font-medium animate-pulse">Loading…</span>
    </div>
  );
}

export default function AppLayout() {
  const { pathname } = useLocation();
  // Only the assistant chat page needs a fixed-height, no-scroll shell.
  const noScroll = pathname === "/assistant";

  return (
    <SidebarProvider
      defaultOpen={getSidebarDefault()}
      className={noScroll ? "!h-svh !overflow-hidden" : undefined}
      style={{
        "--sidebar-width": "calc(var(--spacing) * 56)",
        "--header-height": "calc(var(--spacing) * 12)",
      }}
    >
      <AppSidebar variant="inset" />
      <SidebarInset className={noScroll ? "!h-svh !overflow-hidden" : ""}>
        <Suspense fallback={<ContentSkeleton />}>
          <Outlet />
        </Suspense>
      </SidebarInset>
      <MobileNav />
    </SidebarProvider>
  );
}
