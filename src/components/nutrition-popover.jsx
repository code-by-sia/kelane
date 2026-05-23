"use client";

import { useState } from "react";
import { InfoIcon, LoaderIcon, TriangleAlertIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { fetchNutrition } from "@/services/nutrition";

/**
 * Nutrition Facts popover — EU format (Regulation EU 1169/2011).
 *
 * Shows a small ⓘ icon button. On open, fetches Open Food Facts data
 * for the given ingredient name and renders the EU "Big 8" label:
 *   Energy · Fat (saturates) · Carbohydrate (sugars) · Fibre · Protein · Salt
 * All values are per 100 g, which is the EU mandatory declaration basis.
 */

function Row({ label, value, unit = "g", indent = false }) {
  if (value == null) return null;
  return (
    <div
      className={`flex justify-between text-xs py-0.5 ${indent ? "pl-3 text-muted-foreground" : ""}`}
    >
      <span>{label}</span>
      <span className="font-medium tabular-nums">
        {typeof value === "number" ? value.toFixed(1) : value}
        {unit && <span className="ml-0.5 font-normal">{unit}</span>}
      </span>
    </div>
  );
}

function NutritionLabel({ data }) {
  return (
    <div className="flex flex-col gap-0">
      {/* EU-style header */}
      <div className="mb-2">
        <p className="font-black text-base leading-tight tracking-tight">
          Nutrition Facts
        </p>
        <p className="text-xs text-muted-foreground font-medium mt-0.5">
          Typical values per 100 g
        </p>
      </div>

      {/* Product name (matching Open Food Facts result) */}
      <p className="text-xs text-muted-foreground italic truncate mb-2 border-b pb-2">
        Closest match: {data.productName}
      </p>

      {/* Energy — EU shows kJ first, then kcal in parentheses */}
      {(data.energyKj != null || data.energyKcal != null) && (
        <div className="flex justify-between border-b-2 border-foreground pb-1.5 mb-1.5">
          <span className="font-bold text-sm">Energy</span>
          <span className="font-bold text-sm tabular-nums">
            {data.energyKj != null && (
              <>{data.energyKj}<span className="font-normal text-xs"> kJ</span> / </>
            )}
            {data.energyKcal != null && (
              <>{data.energyKcal}<span className="font-normal text-xs"> kcal</span></>
            )}
          </span>
        </div>
      )}

      {/* EU Big-8 rows */}
      <div className="flex flex-col divide-y divide-border/50">
        <div className="py-0.5">
          <Row label="Fat" value={data.fat} />
          <Row label="of which Saturates" value={data.saturates} indent />
        </div>
        <div className="py-0.5">
          <Row label="Carbohydrate" value={data.carbohydrate} />
          <Row label="of which Sugars" value={data.sugars} indent />
        </div>
        <div className="py-0.5">
          <Row label="Fibre" value={data.fibre} />
        </div>
        <div className="py-0.5">
          <Row label="Protein" value={data.protein} />
        </div>
        <div className="py-0.5">
          {/* EU labels salt, not sodium */}
          <Row label="Salt" value={data.salt} />
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground mt-2 pt-1 border-t">
        Source:{" "}
        <a
          href="https://world.openfoodfacts.org"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2 hover:text-foreground"
        >
          Open Food Facts
        </a>{" "}
        · Open Database Licence
      </p>
    </div>
  );
}

export function NutritionButton({ name }) {
  const [state, setState] = useState("idle"); // idle | loading | done | error
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    if (state !== "idle") return; // already fetched or loading
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
      <PopoverContent
        className="w-64 p-3"
        align="end"
        sideOffset={6}
      >
        {state === "loading" && (
          <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground">
            <LoaderIcon size={15} className="animate-spin" />
            <span className="text-xs">Looking up nutrition…</span>
          </div>
        )}

        {state === "error" && (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <TriangleAlertIcon
              size={20}
              strokeWidth={0.9}
              className="text-amber-500"
            />
            <p className="text-xs text-muted-foreground">
              No nutrition data found for{" "}
              <strong className="text-foreground">"{name}"</strong>.
            </p>
            <button
              className="text-xs underline text-muted-foreground hover:text-foreground"
              onClick={() => {
                setState("idle");
                load();
              }}
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
