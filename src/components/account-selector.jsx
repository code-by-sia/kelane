"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

export default function AccountSelector({
  variant = "outline",
  className,
  value,
  onChange,
}) {
  const [open, setOpen] = React.useState(false);

  const { accounts, getAccount } = useAccountManager();

  const currentAccount = getAccount(value) || {};

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          role="combobox"
          aria-expanded={open}
          className={cn(className, "justify-between")}
        >
          <span className="flex gap-2">
            <strong>{currentAccount?.code}</strong>
            {currentAccount?.name || "Select Account..."}
          </span>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <AccountSelectorContent
        accounts={accounts}
        value={value}
        onChange={(currentValue) => {
          onChange(currentValue === value ? "" : currentValue);
          setOpen(false);
        }}
      />
    </Popover>
  );
}
