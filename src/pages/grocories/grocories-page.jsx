import Header from "@/components/header";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import SidebarPage from "@/pages/sidebar-page";
import { ListTodoIcon, Refrigerator, RefrigeratorIcon } from "lucide-react";

export default function GrocoriesPage() {
  return (
    <SidebarPage>
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel>
          <Header>
            {/* <SidebarTrigger />
            <Separator
              orientation="vertical"
              className="mx-2 data-[orientation=vertical]:h-4"
            />*/}
            <RefrigeratorIcon size={18} />
            Fridge/In-Stock
          </Header>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel>
          <Header>
            <ListTodoIcon size={18} />
            To Buy List
          </Header>
        </ResizablePanel>
      </ResizablePanelGroup>
    </SidebarPage>
  );
}
