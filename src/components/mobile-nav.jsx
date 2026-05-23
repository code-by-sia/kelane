"use client";

/**
 * MobileNav — fixed bottom navigation bar shown only on small screens (< md).
 * Mirrors the five most-used destinations from the desktop sidebar.
 */

import { useState } from "react";
import { useLocation } from "react-router";
import {
  BookHeartIcon,
  CalendarDaysIcon,
  CompassIcon,
  ShoppingBagIcon,
  EllipsisIcon,
  ScanTextIcon,
  RssIcon,
  GlobeIcon,
  TagIcon,
  HistoryIcon,
  SettingsIcon,
} from "lucide-react";
import { RecipeScanner } from "@/components/recipe-scanner";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

const PRIMARY_TABS = [
  { label: "Explore", icon: CompassIcon, href: "/" },
  { label: "Recipes", icon: BookHeartIcon, href: "/my-recipes" },
  { label: "Groceries", icon: ShoppingBagIcon, href: "/groceries" },
  { label: "Calendar", icon: CalendarDaysIcon, href: "/calendar" },
];

const MORE_ITEMS = [
  { label: "Categories", icon: TagIcon, href: "/categories" },
  { label: "Feeds", icon: RssIcon, href: "/feeds" },
  // { label: "Browser",    icon: GlobeIcon,    href: "/browser" },
  { label: "History", icon: HistoryIcon, href: "/history" },
  { label: "Preferences", icon: SettingsIcon, href: "/preferences" },
];

function NavItem({ href, icon: Icon, label, active, onClick }) {
  const Tag = href ? "a" : "button";
  return (
    <Tag
      href={href}
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-[10px] font-medium transition-colors
        ${
          active
            ? "text-primary"
            : "text-muted-foreground active:text-foreground"
        }`}
    >
      <Icon size={22} strokeWidth={active ? 2.2 : 1.7} />
      <span>{label}</span>
    </Tag>
  );
}

export function MobileNav() {
  const { pathname } = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  // Determine which primary tab is active
  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const isMoreActive = MORE_ITEMS.some((i) => pathname.startsWith(i.href));

  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t
                   flex items-stretch h-16 safe-bottom"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {PRIMARY_TABS.map((tab) => (
          <NavItem
            key={tab.href}
            href={tab.href}
            icon={tab.icon}
            label={tab.label}
            active={isActive(tab.href)}
          />
        ))}
        {/* More — opens a drawer */}
        <NavItem
          icon={EllipsisIcon}
          label="More"
          active={isMoreActive}
          onClick={() => setMoreOpen(true)}
        />
      </nav>

      {/* "More" drawer */}
      <Drawer open={moreOpen} onOpenChange={setMoreOpen}>
        <DrawerContent>
          <DrawerHeader className="pb-2">
            <DrawerTitle>More</DrawerTitle>
          </DrawerHeader>
          <div
            className="grid grid-cols-4 gap-0 pb-8 px-4"
            style={{
              paddingBottom: "calc(env(safe-area-inset-bottom) + 2rem)",
            }}
          >
            {MORE_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMoreOpen(false)}
                className={`flex flex-col items-center gap-1.5 py-4 rounded-xl transition-colors
                  ${
                    pathname.startsWith(item.href)
                      ? "text-primary bg-primary/8"
                      : "text-foreground hover:bg-muted active:bg-muted"
                  }`}
              >
                <item.icon size={24} strokeWidth={1.7} />
                <span className="text-xs font-medium">{item.label}</span>
              </a>
            ))}
            {/* Scan Recipe action */}
            <button
              onClick={() => {
                setMoreOpen(false);
                setScannerOpen(true);
              }}
              className="flex flex-col items-center gap-1.5 py-4 rounded-xl transition-colors
                text-foreground hover:bg-muted active:bg-muted"
            >
              <ScanTextIcon size={24} strokeWidth={1.7} />
              <span className="text-xs font-medium">Scan</span>
            </button>
          </div>
        </DrawerContent>
      </Drawer>

      <RecipeScanner open={scannerOpen} onClose={() => setScannerOpen(false)} />
    </>
  );
}
