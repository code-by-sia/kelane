import { useState } from "react";
import Header from "@/components/header";
import { SiteHeader } from "@/components/site-header";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ListTodoIcon, RefrigeratorIcon, ShoppingCartIcon } from "lucide-react";
import SidebarPage from "@/pages/sidebar-page";
import FridgePanel from "./fridge-panel";
import ToBuyPanel from "./to-buy-panel";
import { ExpiryAlert } from "@/components/expiry-alert";
import { RecipeShoppingSheet } from "./recipe-shopping-sheet";
import useGroceriesStore from "@/store/groceries";

export default function GrocoriesPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const fridgeItems = useGroceriesStore((s) => s.fridgeItems);
  const fridgeIsLight = fridgeItems.length < 4;

  const cookFromRecipeBtn = (
    <Button
      variant={fridgeIsLight ? "default" : "outline"}
      size="sm"
      onClick={() => setSheetOpen(true)}
      className="gap-1.5"
    >
      <ShoppingCartIcon size={14} />
      Cook from recipe
    </Button>
  );

  return (
    <SidebarPage
      title="Groceries"
      header={!fridgeIsLight && cookFromRecipeBtn}
    >
      {/* ── Mobile: tabbed layout ─────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-h-0 md:hidden">
        <Tabs defaultValue="buy" className="flex flex-col flex-1 min-h-0">
          <TabsList className="w-full rounded-none border-b h-11 shrink-0 bg-background">
            <TabsTrigger value="fridge" className="flex-1 gap-1.5">
              <RefrigeratorIcon size={15} />
              Fridge
            </TabsTrigger>
            <TabsTrigger value="buy" className="flex-1 gap-1.5">
              <ListTodoIcon size={15} />
              To Buy
            </TabsTrigger>
          </TabsList>
          <TabsContent value="fridge" className="flex flex-col flex-1 min-h-0 mt-0">
            <ExpiryAlert />
            <FridgePanel onCookFromRecipe={() => setSheetOpen(true)} fridgeIsLight={fridgeIsLight} />
          </TabsContent>
          <TabsContent value="buy" className="flex flex-col flex-1 min-h-0 mt-0">
            <ToBuyPanel />
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Desktop: resizable side-by-side ──────────────────────────── */}
      <div className="hidden md:flex flex-1 min-h-0">
        <ResizablePanelGroup
          orientation="horizontal"
          className="flex flex-1 min-h-0"
        >
          <ResizablePanel defaultSize={50} minSize={30} className="flex flex-col">
            <Header>
              <RefrigeratorIcon size={18} />
              <span className="flex-1">Fridge / In-Stock</span>
              {fridgeIsLight && cookFromRecipeBtn}
            </Header>
            <ExpiryAlert />
            <FridgePanel onCookFromRecipe={() => setSheetOpen(true)} fridgeIsLight={fridgeIsLight} />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50} minSize={30} className="flex flex-col">
            <Header>
              <ListTodoIcon size={18} />
              To Buy List
            </Header>
            <ToBuyPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <RecipeShoppingSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </SidebarPage>
  );
}
