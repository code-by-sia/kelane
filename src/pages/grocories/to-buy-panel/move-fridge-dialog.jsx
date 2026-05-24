import { useState } from "react";
import { RefrigeratorIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { SmartExpiryPicker } from "@/components/smart-expiry-picker";

export function MoveFridgeDialog({ items, onConfirm, onCancel }) {
  const [toFridge, setToFridge] = useState(new Set(items.map((i) => i.id)));
  const [expiresAt, setExpiresAt] = useState(null);

  const toggle = (id) =>
    setToFridge((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const allChecked = toFridge.size === items.length;
  const toggleAll = () =>
    setToFridge(allChecked ? new Set() : new Set(items.map((i) => i.id)));

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move to fridge</DialogTitle>
          <DialogDescription>
            Check which items to add to your fridge stock. Unchecked items will
            be removed from the buy list without being added to the fridge.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1 my-1">
          <div className="flex items-center gap-2 pb-1 border-b">
            <Checkbox checked={allChecked} onCheckedChange={toggleAll} />
            <span className="text-xs text-muted-foreground uppercase tracking-wide">All</span>
          </div>
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-2 py-1">
              <Checkbox
                checked={toFridge.has(item.id)}
                onCheckedChange={() => toggle(item.id)}
              />
              <span className="flex-1 text-sm">{item.name}</span>
              {item.quantity && (
                <span className="text-xs text-muted-foreground">
                  {item.quantity} {item.unit}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="border rounded-lg p-3 bg-muted/30 mt-1">
          <p className="text-xs text-muted-foreground mb-2">Expiry date (optional)</p>
          <SmartExpiryPicker value={expiresAt} onChange={setExpiresAt} />
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button
            onClick={() => onConfirm(toFridge, expiresAt)}
            disabled={items.length === 0}
          >
            <RefrigeratorIcon />
            Move {toFridge.size > 0 ? toFridge.size : "none"} to fridge
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
