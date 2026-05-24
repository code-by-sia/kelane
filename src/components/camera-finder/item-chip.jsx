import { CheckCircle2Icon, CircleDotIcon } from "lucide-react";

export function ItemChip({ item, found, onManualFound }) {
  return (
    <button
      onClick={() => !found && onManualFound(item.id)}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
        found
          ? "bg-green-500 text-white"
          : "bg-black/60 text-white hover:bg-black/80 cursor-pointer"
      }`}
    >
      {found ? <CheckCircle2Icon size={11} /> : <CircleDotIcon size={11} />}
      {item.name}
    </button>
  );
}
