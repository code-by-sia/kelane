import { UtensilsIcon } from "lucide-react";
import SidebarPage from "@/pages/sidebar-page";
import useHistoryStore from "@/store/history";
import { HistoryEntry } from "./history-entry";

export default function HistoryPage() {
  const entries = useHistoryStore((s) => s.entries);

  return (
    <SidebarPage title="Cooking History">
      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 text-muted-foreground">
          <UtensilsIcon size={48} strokeWidth={0.8} />
          <p className="text-sm">No cooking history yet. Start cooking a recipe!</p>
        </div>
      ) : (
        <div className="flex flex-col divide-y">
          {entries.map((entry) => (
            <HistoryEntry key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </SidebarPage>
  );
}
