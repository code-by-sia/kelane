export function Row({ label, value, unit = "g", indent = false }) {
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
