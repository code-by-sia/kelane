/**
 * SidebarPage — thin content wrapper used inside AppLayout.
 *
 * AppLayout (layout route) owns the SidebarProvider + AppSidebar + SidebarInset.
 * SidebarPage just provides the optional page header and bottom nav spacer.
 * The `noScroll` prop is handled at AppLayout level via useLocation.
 */

import { SiteHeader } from "@/components/site-header";

export default function SidebarPage({ title, header, children, noScroll }) {
  return (
    <>
      {title && <SiteHeader title={title}>{header}</SiteHeader>}
      {children}
      {/* Spacer so scrollable content isn't hidden behind the mobile bottom nav */}
      {!noScroll && (
        <div className="md:hidden h-16 shrink-0" aria-hidden="true" />
      )}
    </>
  );
}
