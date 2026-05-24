"use client";

import * as React from "react";
import { ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { useCOAs } from "@/hooks/coa";
import { LedgerSelectorContent } from "./ledger-selector-content";

export { LedgerSelectorContent } from "./ledger-selector-content";

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
