import Header from "@/components/header";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListTodoIcon, RefrigeratorIcon } from "lucide-react";
import SidebarPage from "@/pages/sidebar-page";
import FridgePanel from "./fridge-panel";
import ToBuyPanel from "./to-buy-panel";
import { ExpiryAlert } from "@/components/expiry-alert";

export default function GrocoriesPage() {
  return (
    <SidebarPage>
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
            <FridgePanel />
          </TabsContent>
          <TabsContent value="buy" className="flex flex-col flex-1 min-h-0 mt-0">
            <ToBuyPanel />
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Desktop: resizable side-by-side ──────────────────────────── */}
      {/* Wrapper div carries the hidden/flex so react-resizable-panels' inline
          style="display:flex" can't override the hidden class on mobile. */}
      <div className="hidden md:flex flex-1 min-h-0">
      <ResizablePanelGroup
        orientation="horizontal"
        className="flex flex-1 min-h-0"
      >
        <ResizablePanel defaultSize={50} minSize={30} className="flex flex-col">
          <Header>
            <RefrigeratorIcon size={18} />
            Fridge / In-Stock
          </Header>
          <ExpiryAlert />
          <FridgePanel />
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
    </SidebarPage>
  );
}
