import { useEffect, useRef, useState } from "react";
import { CheckIcon, PlayIcon, HourglassIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { playDoneMelody } from "@/lib/beep";
import "./step.css";
import { TimerRing } from "./timer-ring";
import { IngredientChips } from "./ingredient-chips";

export default function Step({ step, stepNumber, totalSteps, onStart, onDone }) {
  const hasTimer = (step.duration ?? 0) > 3;
  const [remaining, setRemaining] = useState(step.duration ?? 0);
  const cardRef = useRef(null);

  const isActive = step.status === "in_progress";
  const isDone = step.status === "completed";
  const canStart = step.dependsOn.length === 0 && step.status === "unknown";

  useEffect(() => {
    if (isActive && cardRef.current) {
      const t = setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 120);
      return () => clearTimeout(t);
    }
  }, [isActive]);

  useEffect(() => {
    if (!isActive || !hasTimer) return;
    if (remaining <= 0) {
      playDoneMelody();
      onDone();
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1_000);
    return () => clearTimeout(t);
  }, [isActive, remaining, hasTimer]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isDone) {
    return (
      <div className="step-done">
        <div className="step-done__badge">
          <CheckIcon size={11} className="text-green-600" strokeWidth={2.5} />
        </div>
        <p className="flex-1 text-sm text-muted-foreground line-through truncate">{step.action}</p>
        <span className="text-xs text-muted-foreground/60 shrink-0 font-mono">{stepNumber}</span>
      </div>
    );
  }

  if (isActive) {
    return (
      <div ref={cardRef} className="step-active">
        <div className="flex items-center gap-2">
          <div className="step-active__badge">
            <span className="text-[11px] font-bold text-primary-foreground">{stepNumber}</span>
          </div>
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
            Step {stepNumber} of {totalSteps}
          </span>
        </div>

        {hasTimer && (
          <div className="flex justify-center py-2">
            <TimerRing total={step.duration} remaining={remaining} />
          </div>
        )}

        <p className="text-base font-medium leading-relaxed">{step.action}</p>
        <IngredientChips ingredients={step.ingredients} />

        {step.tools?.length > 0 && (
          <p className="text-xs text-muted-foreground">
            🔧 <span className="italic">{step.tools.join(" · ")}</span>
          </p>
        )}

        <Button size="lg" className="w-full h-13 text-base mt-1" onClick={onDone}>
          <CheckIcon size={18} strokeWidth={2.5} />
          Mark as Done
        </Button>
      </div>
    );
  }

  if (canStart) {
    return (
      <div className="step-start">
        <div className="step-start__badge">
          <span className="text-xs font-semibold text-muted-foreground">{stepNumber}</span>
        </div>
        <p className="flex-1 text-sm text-foreground/80 leading-snug">{step.action}</p>
        <Button size="sm" variant="outline" onClick={onStart} className="shrink-0 gap-1.5">
          <PlayIcon size={13} />
          Start
        </Button>
      </div>
    );
  }

  return (
    <div className="step-waiting">
      <div className="step-waiting__badge">
        <span className="text-xs text-muted-foreground">{stepNumber}</span>
      </div>
      <p className="flex-1 text-sm text-muted-foreground leading-snug">{step.action}</p>
      <HourglassIcon size={14} className="shrink-0 text-muted-foreground/50" />
    </div>
  );
}
