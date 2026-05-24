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
import { DynamicIcon } from "lucide-react/dynamic";

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
