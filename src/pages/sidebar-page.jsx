import { AppSidebar } from "@/components/app-sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import "./sidebar-page.css";

/**
 * noScroll — pass this when the page manages its own internal scroll
 * (e.g. the assistant chat). It bounds the SidebarInset to 100svh so the
 * viewport never scrolls; content areas inside must handle their own overflow.
 */
export default function SidebarPage({ title, header, children, noScroll }) {
  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 56)",
        "--header-height": "calc(var(--spacing) * 12)",
      }}
    >
      <AppSidebar variant="inset" />
      <SidebarInset className={noScroll ? "!h-svh !overflow-hidden" : ""}>
        {title && <SiteHeader title={title}>{header}</SiteHeader>}
        {children}
        {/* Spacer so scrollable content isn't hidden behind the mobile bottom nav */}
        {!noScroll && <div className="md:hidden h-16 shrink-0" aria-hidden="true" />}
      </SidebarInset>
      <MobileNav />
    </SidebarProvider>
  );
}
