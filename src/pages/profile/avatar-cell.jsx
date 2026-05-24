import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function AvatarCell({ avatar, selected, onSelect }) {
  return (
    <button
      type="button"
      title={avatar.label}
      onClick={() => onSelect(avatar.emoji)}
      className={cn(
        "relative flex items-center justify-center rounded-2xl text-2xl aspect-square",
        "transition-all duration-150 cursor-pointer",
        selected
          ? "bg-primary/15 ring-2 ring-primary ring-offset-2 scale-105 shadow-md"
          : "bg-muted hover:bg-accent hover:scale-105",
      )}
    >
      {avatar.emoji}
      {selected && (
        <span className="absolute -top-1 -right-1 size-4 rounded-full bg-primary flex items-center justify-center shadow">
          <CheckIcon size={9} className="text-primary-foreground" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}
