import { useState } from "react";
import { differenceInDays, parseISO } from "date-fns";
import { AlertTriangleIcon, XIcon } from "lucide-react";
import { Button } from "./ui/button";
import useGroceriesStore from "@/store/groceries";

const WARN_DAYS = 3;

function groupFridgeItems(items) {
  const map = new Map();
  for (const item of items) {
    const key = item.name.toLowerCase();
    if (!map.has(key)) {
      map.set(key, { name: item.name, expiresAt: item.expiresAt });
    } else {
      const g = map.get(key);
      if (item.expiresAt && (!g.expiresAt || item.expiresAt < g.expiresAt))
        g.expiresAt = item.expiresAt;
    }
  }
  return [...map.values()];
}

export function ExpiryAlert() {
  const fridgeItems = useGroceriesStore((s) => s.fridgeItems);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const grouped = groupFridgeItems(fridgeItems);
  const expiring = grouped.filter((item) => {
    if (!item.expiresAt) return false;
    const days = differenceInDays(parseISO(item.expiresAt), new Date());
    return days <= WARN_DAYS;
  });

  if (expiring.length === 0) return null;

  const expired = expiring.filter((i) => differenceInDays(parseISO(i.expiresAt), new Date()) < 0);
  const soonExpiring = expiring.filter((i) => differenceInDays(parseISO(i.expiresAt), new Date()) >= 0);

  return (
    <div className="flex items-start gap-2 px-4 py-2.5 bg-amber-50 border-b border-amber-200 text-amber-900">
      <AlertTriangleIcon size={15} className="shrink-0 mt-0.5 text-amber-500" />
      <p className="flex-1 text-xs leading-relaxed">
        {expired.length > 0 && (
          <span className="font-semibold text-red-700">
            Expired: {expired.map((i) => i.name).join(", ")}.{" "}
          </span>
        )}
        {soonExpiring.length > 0 && (
          <span>
            Expiring soon:{" "}
            {soonExpiring.map((i) => {
              const days = differenceInDays(parseISO(i.expiresAt), new Date());
              return `${i.name} (${days === 0 ? "today" : days === 1 ? "tomorrow" : `${days}d`})`;
            }).join(", ")}.
          </span>
        )}
      </p>
      <Button
        variant="ghost"
        size="icon-sm"
        className="text-amber-700 hover:bg-amber-100 shrink-0 -mt-0.5"
        onClick={() => setDismissed(true)}
      >
        <XIcon size={13} />
      </Button>
    </div>
  );
}
