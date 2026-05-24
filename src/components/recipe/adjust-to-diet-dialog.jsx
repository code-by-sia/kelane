import { useState, useMemo } from "react";
import { AppleIcon, ArrowRightIcon, CheckIcon, UndoIcon, XIcon } from "lucide-react";
import { DIETS, findSubstitutions } from "@/lib/diet-substitutions";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";

export function AdjustToDietDialog({ open, onClose, ingredients, onApply }) {
  const [selectedDiet, setSelectedDiet] = useState(DIETS[0].id);
  // dismissed[ingredientIndex] = true means user said "keep original"
  const [dismissed, setDismissed] = useState({});

  const substitutions = useMemo(
    () => findSubstitutions(ingredients ?? [], selectedDiet),
    [ingredients, selectedDiet],
  );

  // Reset dismissals when diet changes
  const handleDietChange = (id) => {
    setSelectedDiet(id);
    setDismissed({});
  };

  const toggleDismiss = (idx) =>
    setDismissed((d) => ({ ...d, [idx]: !d[idx] }));

  const activeSubs = substitutions.filter((s) => !dismissed[s.ingredientIndex]);

  const apply = () => {
    // Build updated ingredients list
    const updated = [...(ingredients ?? [])];
    for (const sub of activeSubs) {
      // Preserve any leading quantity from the original ingredient string
      const original = sub.original;
      const qtyMatch = original.match(/^(\d+\.?\d*\s*(?:g|kg|ml|l|tbsp|tsp|cup|pcs)?)\s+/i);
      updated[sub.ingredientIndex] = qtyMatch
        ? `${qtyMatch[1]} ${sub.replacement}`
        : sub.replacement;
    }
    onApply(updated, selectedDiet);
    onClose();
  };

  const diet = DIETS.find((d) => d.id === selectedDiet);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg flex flex-col max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AppleIcon size={16} className="text-green-600" />
            Adjust to diet
          </DialogTitle>
          <DialogDescription>
            Select a diet — substitutions are previewed below. Accept or dismiss
            each suggestion before applying.
          </DialogDescription>
        </DialogHeader>

        {/* Diet selector */}
        <div className="flex flex-wrap gap-2">
          {DIETS.map((d) => (
            <button
              key={d.id}
              onClick={() => handleDietChange(d.id)}
              className={`diet-btn ${selectedDiet === d.id ? "diet-btn--active" : "diet-btn--idle"}`}
            >
              <span>{d.emoji}</span>
              {d.label}
            </button>
          ))}
        </div>

        {/* Substitution list */}
        <div className="flex-1 overflow-y-auto min-h-0 flex flex-col gap-1">
          {substitutions.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
              <CheckIcon size={32} strokeWidth={0.8} className="text-green-500" />
              <p className="text-sm">
                No changes needed — all ingredients already suit the{" "}
                <strong>{diet?.label}</strong> diet.
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground mb-1">
                {activeSubs.length} of {substitutions.length} substitution
                {substitutions.length !== 1 ? "s" : ""} active
              </p>
              {substitutions.map((sub) => {
                const isDismissed = !!dismissed[sub.ingredientIndex];
                return (
                  <div
                    key={sub.ingredientIndex}
                    className={`diet-sub-item ${isDismissed ? "diet-sub-item--dismissed" : "diet-sub-item--active"}`}
                  >
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <span
                        className={`truncate ${isDismissed ? "line-through text-muted-foreground" : ""}`}
                      >
                        {sub.original}
                      </span>
                      {!isDismissed && (
                        <>
                          <ArrowRightIcon
                            size={13}
                            className="shrink-0 text-muted-foreground"
                          />
                          <span className="font-medium text-green-700 truncate">
                            {sub.replacement}
                          </span>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => toggleDismiss(sub.ingredientIndex)}
                      title={isDismissed ? "Restore substitution" : "Keep original"}
                      className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {isDismissed ? (
                        <UndoIcon size={14} />
                      ) : (
                        <XIcon size={14} />
                      )}
                    </button>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={apply}
            disabled={activeSubs.length === 0 && substitutions.length === 0}
          >
            <CheckIcon size={14} />
            Apply {activeSubs.length > 0 ? `${activeSubs.length} swap${activeSubs.length !== 1 ? "s" : ""}` : ""}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
