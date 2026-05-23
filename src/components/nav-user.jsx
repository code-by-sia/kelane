"use client";

import {
  IconDotsVertical,
  IconLogout,
  IconUserCircle,
} from "@tabler/icons-react";
import { UtensilsIcon } from "lucide-react";
import { useNavigate } from "react-router";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import useSetupStore from "@/store/setup";
import { cn } from "@/lib/utils";
import "./nav-user.css";

function nameInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0]?.toUpperCase())
    .slice(0, 2)
    .join("");
}

/** Displays the user avatar — emoji if set, otherwise initials. */
function UserAvatar({ name, avatarEmoji, className }) {
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

export function NavUser() {
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const profile = useSetupStore((s) => s.profile);
  const preferences = useSetupStore((s) => s.preferences);
  const resetSetup = useSetupStore((s) => s.resetSetup);

  const name  = profile?.name  || "Chef";
  const email = profile?.email || "";
  const avatar = profile?.avatar || "";
  const tags  = preferences?.dietaryTags ?? [];

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <UserAvatar name={name} avatarEmoji={avatar} className="h-8 w-8" />
              <div className="nav-user-info">
                <span className="nav-user-name">{name}</span>
                <span className="nav-user-sub">
                  {email || (tags.length > 0 ? tags.join(", ") : "Kelane")}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <UserAvatar name={name} avatarEmoji={avatar} className="h-8 w-8" />
                <div className="nav-user-info">
                  <span className="nav-user-name">{name}</span>
                  {email && <span className="nav-user-sub">{email}</span>}
                  {tags.length > 0 && (
                    <span className="nav-user-sub">{tags.join(" · ")}</span>
                  )}
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <IconUserCircle />
                Edit profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/preferences")}>
                <UtensilsIcon size={16} />
                Preferences
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => {
                resetSetup();
                navigate("/setup");
              }}
            >
              <IconLogout />
              Reset onboarding
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
