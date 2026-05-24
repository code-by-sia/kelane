"use client";

import * as React from "react";
import { ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { useAccountManager } from "@/hooks/account";
import { AccountSelectorContent } from "./account-selector-content";

export { AccountSelectorContent } from "./account-selector-content";

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
