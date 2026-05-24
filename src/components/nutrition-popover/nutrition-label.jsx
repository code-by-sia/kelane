import { Row } from "./row";

export function NutritionLabel({ data }) {
  return (
    <div className="flex flex-col gap-0">
      <div className="mb-2">
        <p className="font-black text-base leading-tight tracking-tight">Nutrition Facts</p>
        <p className="text-xs text-muted-foreground font-medium mt-0.5">Typical values per 100 g</p>
      </div>

      <p className="text-xs text-muted-foreground italic truncate mb-2 border-b pb-2">
        Closest match: {data.productName}
      </p>

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
