import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

function nameInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0]?.toUpperCase())
    .slice(0, 2)
    .join("");
}

export function UserAvatar({ name, avatarEmoji, className }) {
  return (
    <Avatar className={cn("nav-user-avatar", className)}>
      <AvatarFallback
        className={cn(
          "nav-user-avatar__fallback",
          avatarEmoji
            ? "nav-user-avatar__fallback--emoji"
            : "nav-user-avatar__fallback--initials",
        )}
      >
        {avatarEmoji || nameInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
