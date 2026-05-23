import { useState } from "react";
import { CameraIcon, PlusIcon, Trash2Icon, RefrigeratorIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { IngredientInput } from "@/components/ingredient-input";
import { NutritionButton } from "@/components/nutrition-popover";
import { CameraFinder } from "@/components/camera-finder";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { SmartExpiryPicker } from "@/components/smart-expiry-picker";
import useGroceriesStore from "@/store/groceries";

const UNITS = ["pcs", "g", "kg", "ml", "L", "tbsp", "tsp", "cup"];
const EMPTY = { name: "", quantity: "", unit: "pcs" };

function MoveFridgeDialog({ items, onConfirm, onCancel }) {
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

export default function ToBuyPanel() {
  const toBuyItems = useGroceriesStore((s) => s.toBuyItems);
  const addToBuyItem = useGroceriesStore((s) => s.addToBuyItem);
  const removeToBuyItem = useGroceriesStore((s) => s.removeToBuyItem);
  const removeToBuyItems = useGroceriesStore((s) => s.removeToBuyItems);
  const toggleToBuyItem = useGroceriesStore((s) => s.toggleToBuyItem);
  const clearCheckedToBuyItems = useGroceriesStore((s) => s.clearCheckedToBuyItems);
  const moveToFridge = useGroceriesStore((s) => s.moveToFridge);
  const moveMultipleToFridge = useGroceriesStore((s) => s.moveMultipleToFridge);

  const [form, setForm] = useState(EMPTY);
  const [formExpiry, setFormExpiry] = useState(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    addToBuyItem({
      name: form.name.trim(),
      quantity: form.quantity ? Number(form.quantity) : null,
      unit: form.unit,
      expiresAt: formExpiry,
    });
    setForm(EMPTY);
    setFormExpiry(null);
    setOpen(false);
  };

  const toggleSelect = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const clearSelection = () => setSelected(new Set());

  const batchDelete = () => {
    removeToBuyItems(selected);
    clearSelection();
  };

  const handleMoveConfirm = (fridgeIds, expiresAt) => {
    const removeOnly = new Set([...selected].filter((id) => !fridgeIds.has(id)));
    moveMultipleToFridge(fridgeIds, removeOnly, expiresAt);
    setMoveDialogOpen(false);
    clearSelection();
  };

  const checkedCount = toBuyItems.filter((i) => i.checked).length;
  const selectedItems = toBuyItems.filter((i) => selected.has(i.id));
  const allSelected = toBuyItems.length > 0 && selected.size === toBuyItems.length;

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(toBuyItems.map((i) => i.id)));

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto divide-y">
        {toBuyItems.length === 0 && (
          <p className="text-sm text-muted-foreground p-4">Nothing to buy.</p>
        )}
        {toBuyItems.map((item) => {
          const isSelected = selected.has(item.id);
          const inBatchMode = selected.size > 0;
          return (
            <div
              key={item.id}
              className={`group flex items-center gap-2 px-4 py-2 transition-colors ${
                isSelected ? "bg-accent/40" : ""
              }`}
            >
              {/* Selection checkbox — hidden until hover or batch mode is active.
                  Uses a fixed-width wrapper so layout doesn't shift. */}
              <div
                className={`shrink-0 transition-opacity ${
                  inBatchMode || isSelected
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100"
                }`}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggleSelect(item.id)}
                />
              </div>

              {/* Primary action: mark as bought */}
              <Checkbox
                checked={item.checked}
                onCheckedChange={() => toggleToBuyItem(item.id)}
              />

              <span
                className={`flex-1 text-sm ${
                  item.checked
                    ? "line-through text-muted-foreground"
                    : "font-medium"
                }`}
              >
                {item.name}
              </span>

              {item.quantity && (
                <span className="text-xs text-muted-foreground shrink-0">
                  {item.quantity} {item.unit}
                </span>
              )}

              <NutritionButton name={item.name} />
              <Button
                variant="ghost"
                size="icon-sm"
                title="Move to fridge"
                onClick={() => moveToFridge(item.id)}
              >
                <RefrigeratorIcon size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => removeToBuyItem(item.id)}
              >
                <Trash2Icon size={14} />
              </Button>
            </div>
          );
        })}
      </div>

      {selected.size > 0 && (
        <div className="border-t px-4 py-2 flex items-center gap-2 bg-accent">
          <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
          <span className="text-sm flex-1">{selected.size} selected</span>
          <Button size="sm" variant="ghost" onClick={clearSelection}>Cancel</Button>
          <Button size="sm" variant="outline" onClick={() => setMoveDialogOpen(true)}>
            <RefrigeratorIcon size={14} /> To fridge
          </Button>
          <Button size="sm" variant="destructive" onClick={batchDelete}>
            <Trash2Icon size={14} /> Delete
          </Button>
        </div>
      )}

      <div className="border-t p-4 flex flex-col gap-2">
        {checkedCount > 0 && selected.size === 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground self-end"
            onClick={clearCheckedToBuyItems}
          >
            Clear {checkedCount} checked
          </Button>
        )}

        {open ? (
          <form onSubmit={submit} className="flex flex-col gap-2">
            <IngredientInput
              placeholder="Item name"
              autoFocus
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <div className="flex gap-2">
              <Input
                type="number"
                min="0"
                placeholder="Qty"
                className="w-20"
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
              />
              <select
                value={form.unit}
                onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                className="border rounded-md px-2 text-sm bg-background"
              >
                {UNITS.map((u) => <option key={u}>{u}</option>)}
              </select>
            </div>

            <div className="border rounded-lg p-2.5 bg-muted/30">
              <p className="text-xs text-muted-foreground mb-1.5">Expiry date (optional)</p>
              <SmartExpiryPicker value={formExpiry} onChange={setFormExpiry} />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => { setOpen(false); setFormExpiry(null); }}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm">Add</Button>
            </div>
          </form>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => setOpen(true)}>
              <PlusIcon /> Add item
            </Button>
            <Button
              variant="outline"
              size="sm"
              title="Find items with camera"
              onClick={() => setCameraOpen(true)}
            >
              <CameraIcon size={14} />
            </Button>
          </div>
        )}
      </div>

      {moveDialogOpen && (
        <MoveFridgeDialog
          items={selectedItems}
          onConfirm={handleMoveConfirm}
          onCancel={() => setMoveDialogOpen(false)}
        />
      )}
      <CameraFinder open={cameraOpen} onClose={() => setCameraOpen(false)} />
    </div>
  );
}
