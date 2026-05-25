"use client";

import { useState } from "react";
import { useLocation } from "react-router";
import {
  BookHeartIcon,
  CalendarDaysIcon,
  SparklesIcon,
  CompassIcon,
  ShoppingBagIcon,
  EllipsisIcon,
  ScanTextIcon,
  RssIcon,
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
import "./mobile-nav.css";
import { NavItem } from "./nav-item";

const PRIMARY_TABS = [
  { label: "Explore",   icon: CompassIcon,      href: "/" },
  { label: "Recipes",   icon: BookHeartIcon,    href: "/my-recipes" },
  { label: "Groceries", icon: ShoppingBagIcon,  href: "/groceries" },
  { label: "Calendar",  icon: CalendarDaysIcon, href: "/calendar" },
];

const MORE_ITEMS = [
  { label: "Assistant",   icon: SparklesIcon, href: "/assistant" },
  { label: "Categories",  icon: TagIcon,      href: "/categories" },
  { label: "Feeds",       icon: RssIcon,      href: "/feeds" },
  { label: "History",     icon: HistoryIcon,  href: "/history" },
  { label: "Preferences", icon: SettingsIcon, href: "/preferences" },
];

export function MobileNav() {
  const { pathname } = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const isMoreActive = MORE_ITEMS.some((i) => pathname.startsWith(i.href));

  return (
    <>
      <nav className="mobile-nav">
        {PRIMARY_TABS.map((tab) => (
          <NavItem key={tab.href} href={tab.href} icon={tab.icon} label={tab.label} active={isActive(tab.href)} />
        ))}
        <NavItem icon={EllipsisIcon} label="More" active={isMoreActive} onClick={() => setMoreOpen(true)} />
      </nav>

      <Drawer open={moreOpen} onOpenChange={setMoreOpen}>
        <DrawerContent>
          <DrawerHeader className="pb-2">
            <DrawerTitle>More</DrawerTitle>
          </DrawerHeader>
          <div
            className="mobile-nav__drawer-grid"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 2rem)" }}
          >
            {MORE_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMoreOpen(false)}
                className={`mobile-nav__drawer-item ${
                  pathname.startsWith(item.href)
                    ? "mobile-nav__drawer-item--active"
                    : "mobile-nav__drawer-item--idle"
                }`}
              >
                <item.icon size={24} strokeWidth={1.7} />
                <span className="text-xs font-medium">{item.label}</span>
              </a>
            ))}
            <button
              onClick={() => { setMoreOpen(false); setScannerOpen(true); }}
              className="mobile-nav__drawer-item mobile-nav__drawer-item--idle"
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
