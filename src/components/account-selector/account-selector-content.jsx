"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { PopoverContent } from "@/components/ui/popover";
import { useAccountManager } from "@/hooks/account";

export function AccountSelectorContent({ value, onChange }) {
  const { accounts } = useAccountManager();
  return (
    <PopoverContent className="w-fit p-0">
      <Command>
        <CommandInput placeholder="Search Account..." className="h-9" />
        <CommandList>
          <CommandEmpty>No account found.</CommandEmpty>
          <CommandGroup>
            {accounts.map((account) => (
              <CommandItem
                key={account.code}
                value={account.code}
                onSelect={onChange}
              >
                <span className="flex gap-2">
                  <strong>{account?.code}</strong>
                  {account.name}
                </span>
                <Check
                  className={cn(
                    "ml-auto",
                    value === account.code ? "opacity-100" : "opacity-0",
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  );
}
