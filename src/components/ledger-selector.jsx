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

import { DynamicIcon } from "lucide-react/dynamic";
import { useCOAs } from "@/hooks/coa";

export function LedgerSelectorContent({ coas = [], value, onChange }) {
  return (
    <PopoverContent className="w-fit p-0">
      <Command>
        <CommandInput placeholder="Search COA..." className="h-9" />
        <CommandList>
          <CommandEmpty>No COA found.</CommandEmpty>
          <CommandGroup>
            {coas.map((coa) => (
              <CommandItem
                key={"coa" + coa.code}
                value={coa.code + ""}
                onSelect={onChange}
              >
                <span className="flex gap-2">
                  <DynamicIcon name={coa.icon} />
                  <strong>{coa?.code}</strong>
                  {coa.name}
                </span>
                <Check
                  className={cn(
                    "ml-auto",
                    value === coa.code ? "opacity-100" : "opacity-0",
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

export default function LedgerSelector({
  className,
  disabled,
  variant = "outline",
  codes = [],
  value,
  onChange,
}) {
  const [open, setOpen] = React.useState(false);

  const coas = useCOAs(codes);

  const currentCOA = coas.find((coa) => coa.code == value) || {};

  return (
    <Popover open={open} onOpenChange={setOpen} disabled={disabled}>
      <PopoverTrigger asChild>
        <Button
          disabled={disabled}
          variant={variant}
          role="combobox"
          aria-expanded={open}
          className={cn(className, "justify-between")}
        >
          <span className="flex gap-2">
            <strong>{currentCOA?.code}</strong>
            {currentCOA?.name || "Select COA..."}
          </span>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <LedgerSelectorContent
        coas={coas}
        value={value}
        onChange={(nv) => {
          onChange(nv);
          setOpen(false);
        }}
      />
    </Popover>
  );
}
