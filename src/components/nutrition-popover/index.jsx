"use client";

import { useState } from "react";
import { InfoIcon, LoaderIcon, TriangleAlertIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { fetchNutrition } from "@/services/nutrition";
import { NutritionLabel } from "./nutrition-label";

export function NutritionButton({ name }) {
  const [state, setState] = useState("idle"); // idle | loading | done | error
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    if (state !== "idle") return;
    setState("loading");
    const result = await fetchNutrition(name);
    if (result) {
      setData(result);
      setState("done");
    } else {
      setState("error");
    }
  };

  const handleOpenChange = (v) => {
    setOpen(v);
    if (v) load();
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          title={`Nutrition facts — ${name}`}
          className="text-muted-foreground hover:text-foreground"
        >
          <InfoIcon size={13} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end" sideOffset={6}>
        {state === "loading" && (
          <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground">
            <LoaderIcon size={15} className="animate-spin" />
            <span className="text-xs">Looking up nutrition…</span>
          </div>
        )}

        {state === "error" && (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <TriangleAlertIcon size={20} strokeWidth={0.9} className="text-amber-500" />
            <p className="text-xs text-muted-foreground">
              No nutrition data found for{" "}
              <strong className="text-foreground">"{name}"</strong>.
            </p>
            <button
              className="text-xs underline text-muted-foreground hover:text-foreground"
              onClick={() => { setState("idle"); load(); }}
            >
              Try again
            </button>
          </div>
        )}

        {state === "done" && data && <NutritionLabel data={data} />}
      </PopoverContent>
    </Popover>
  );
}
