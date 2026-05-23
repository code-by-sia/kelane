import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import "./site-header.css";

export function SiteHeader({ title, children }) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <h1 className="site-header__title">{title}</h1>
        <span className="site-header__spacer" />
        {children}
      </div>
    </header>
  );
}
