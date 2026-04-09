import { COA } from "@/data/coa";
import { Badge } from "./ui/badge";
import { DynamicIcon } from "lucide-react/dynamic";

export default function AccountCell({ row }) {
  const value = row.original;
  const acc = COA.find((acc) => acc.code == value?.ledger) || {};

  return (
    <div className="flex justify-between items-center max-w-lg">
      <DynamicIcon size="16" name={acc.icon} />
      <div className="flex-1 ms-2 me-4">
        <strong>{value?.ledger}</strong> {acc?.name}
      </div>
      <Badge className="font-mono text-xs">{value?.account}</Badge>
    </div>
  );
}
