import Header from "@/components/header";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ListTodoIcon, RefrigeratorIcon } from "lucide-react";
import SidebarPage from "@/pages/sidebar-page";
import FridgePanel from "./fridge-panel";
import ToBuyPanel from "./to-buy-panel";

export default function GrocoriesPage() {
  return (
    <SidebarPage>
      <ResizablePanelGroup orientation="horizontal" className="h-full">
        <ResizablePanel defaultSize={50} minSize={30} className="flex flex-col">
          <Header>
            <RefrigeratorIcon size={18} />
            Fridge / In-Stock
          </Header>
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
    </SidebarPage>
  );
}
