import { useMemo } from "react";

export default function DateCell({ row }) {
  const value = row.original.date;
  const formatted = useMemo(
    () => new Date(value).toLocaleDateString(),
    [value],
  );
  return <span>{formatted}</span>;
}
