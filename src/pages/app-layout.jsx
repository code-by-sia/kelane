/**
 * Persistent app shell — renders the sidebar once and keeps it alive across
 * all navigations. The lazy-loaded page content goes inside <Outlet> which
 * has its own Suspense boundary so the sidebar never disappears during loading.
 */

import { Suspense } from "react";
import { Outlet, useLocation, useNavigation } from "react-router";
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

/** Shown only on the very first visit to a page (before the JS chunk is cached). */
function ContentSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 h-64 text-muted-foreground">
      <CookingIcon size={48} />
      <span className="text-sm font-medium animate-pulse">Loading…</span>
    </div>
  );
}

/**
 * Slim top bar shown during within-session navigations (chunks already cached,
 * React Router uses startTransition so old content stays visible — this bar
 * is the only visual signal that a navigation is in progress).
 */
function NavigationProgress() {
  const { state } = useNavigation();
  if (state === "idle") return null;
  return (
    <div
      className="absolute inset-x-0 top-0 h-0.5 z-50 overflow-hidden"
      aria-hidden="true"
    >
      <div className="h-full w-1/2 bg-primary animate-nav-progress" />
    </div>
  );
}

export default function AppLayout() {
  const { pathname } = useLocation();
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
      <SidebarInset className="relative overflow-hidden">
        <NavigationProgress />
        <Suspense fallback={<ContentSkeleton />}>
          <Outlet />
        </Suspense>
      </SidebarInset>
      <MobileNav />
    </SidebarProvider>
  );
}
