import { AppSidebar } from "@/components/app-sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import "./sidebar-page.css";

export default function SidebarPage({ title, header, children }) {
  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 56)",
        "--header-height": "calc(var(--spacing) * 12)",
      }}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        {title && <SiteHeader title={title}>{header}</SiteHeader>}
        {children}
        {/* Spacer so scrollable content isn't hidden behind the mobile bottom nav */}
        <div className="md:hidden h-16 shrink-0" aria-hidden="true" />
      </SidebarInset>
      <MobileNav />
    </SidebarProvider>
  );
}
