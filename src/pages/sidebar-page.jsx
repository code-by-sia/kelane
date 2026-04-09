import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import "./sidebar-page.css";
export default function SidebarPage({ title, header, children }) {
  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      }}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        {title && <SiteHeader title={title}>{header}</SiteHeader>}
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
