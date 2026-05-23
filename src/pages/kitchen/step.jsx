import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { CheckIcon, PlayIcon, HourglassIcon, TimerIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { playDoneMelody } from "@/lib/beep";

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

// ── Circular timer ring ────────────────────────────────────────────────────────

const RING_R = 46;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_R;

function TimerRing({ total, remaining }) {
  const progress = total > 0 ? remaining / total : 0;
  const dashOffset = RING_CIRCUMFERENCE * (1 - progress);
  const urgent = remaining <= 30 && remaining > 0;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        className="-rotate-90"
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx="60"
          cy="60"
          r={RING_R}
          fill="none"
          stroke="currentColor"
          strokeWidth="7"
          className="text-muted-foreground/15"
        />
        {/* Progress */}
        <circle
          cx="60"
          cy="60"
          r={RING_R}
          fill="none"
          stroke="currentColor"
          strokeWidth="7"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          className={cn(
            "transition-all duration-1000",
            urgent ? "text-destructive" : "text-primary",
          )}
        />
      </svg>
      {/* Counter text (rotate back since parent is -90°) */}
      <div className="absolute flex flex-col items-center rotate-0">
        <TimerIcon
          size={14}
          className={cn(
            "mb-0.5",
            urgent ? "text-destructive" : "text-muted-foreground",
          )}
        />
        <span
          className={cn(
            "text-2xl font-mono font-bold tabular-nums leading-none",
            urgent ? "text-destructive" : "text-foreground",
          )}
        >
          {formatTime(remaining)}
        </span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
          left
        </span>
      </div>
    </div>
  );
}

// ── Ingredient chips ───────────────────────────────────────────────────────────

function IngredientChips({ ingredients }) {
  if (!ingredients?.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {ingredients.map((ing) => (
        <span
          key={ing}
          className="text-xs bg-primary/8 text-primary border border-primary/20 rounded-full px-2.5 py-0.5 font-medium"
        >
          {ing}
        </span>
      ))}
    </div>
  );
}

// ── Step component ────────────────────────────────────────────────────────────

export default function Step({ step, stepNumber, totalSteps, onStart, onDone }) {
  const hasTimer = (step.duration ?? 0) > 3;
  const [remaining, setRemaining] = useState(step.duration ?? 0);
  const cardRef = useRef(null);

  const isActive = step.status === "in_progress";
  const isDone = step.status === "completed";
  const canStart = step.dependsOn.length === 0 && step.status === "unknown";

  // Scroll active card into view
  useEffect(() => {
    if (isActive && cardRef.current) {
      const t = setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 120);
      return () => clearTimeout(t);
    }
  }, [isActive]);

  // Countdown timer
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

  // ── Completed — compact row ──────────────────────────────────────────────
  if (isDone) {
    return (
      <div className="flex items-center gap-3 px-1 py-1.5">
        <div className="size-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
          <CheckIcon size={11} className="text-green-600" strokeWidth={2.5} />
        </div>
        <p className="flex-1 text-sm text-muted-foreground line-through truncate">
          {step.action}
        </p>
        <span className="text-xs text-muted-foreground/60 shrink-0 font-mono">
          {stepNumber}
        </span>
      </div>
    );
  }

  // ── Active — large card with timer + big action ──────────────────────────
  if (isActive) {
    return (
      <div
        ref={cardRef}
        className="rounded-2xl border-2 border-primary/25 bg-card shadow-xl p-5 flex flex-col gap-4"
      >
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-full bg-primary flex items-center justify-center shrink-0">
            <span className="text-[11px] font-bold text-primary-foreground">
              {stepNumber}
            </span>
          </div>
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
            Step {stepNumber} of {totalSteps}
          </span>
        </div>

        {/* Timer ring (centered) */}
        {hasTimer && (
          <div className="flex justify-center py-2">
            <TimerRing total={step.duration} remaining={remaining} />
          </div>
        )}

        {/* Action text */}
        <p className="text-base font-medium leading-relaxed">{step.action}</p>

        {/* Ingredients */}
        <IngredientChips ingredients={step.ingredients} />

        {/* Tools */}
        {step.tools?.length > 0 && (
          <p className="text-xs text-muted-foreground">
            🔧{" "}
            <span className="italic">{step.tools.join(" · ")}</span>
          </p>
        )}

        {/* Mark done button */}
        <Button
          size="lg"
          className="w-full h-13 text-base mt-1"
          onClick={onDone}
        >
          <CheckIcon size={18} strokeWidth={2.5} />
          Mark as Done
        </Button>
      </div>
    );
  }

  // ── Can start — outlined card with Start button ──────────────────────────
  if (canStart) {
    return (
      <div className="rounded-xl border border-border bg-card/50 px-4 py-3.5 flex items-center gap-3">
        <div className="size-6 rounded-full border-2 border-muted-foreground/25 flex items-center justify-center shrink-0">
          <span className="text-xs font-semibold text-muted-foreground">
            {stepNumber}
          </span>
        </div>
        <p className="flex-1 text-sm text-foreground/80 leading-snug">
          {step.action}
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={onStart}
          className="shrink-0 gap-1.5"
        >
          <PlayIcon size={13} />
          Start
        </Button>
      </div>
    );
  }

  // ── Waiting — dimmed row ─────────────────────────────────────────────────
  return (
    <div className="flex items-center gap-3 px-1 py-2 opacity-35">
      <div className="size-6 rounded-full border border-muted-foreground/30 flex items-center justify-center shrink-0">
        <span className="text-xs text-muted-foreground">{stepNumber}</span>
      </div>
      <p className="flex-1 text-sm text-muted-foreground leading-snug">
        {step.action}
      </p>
      <HourglassIcon size={14} className="shrink-0 text-muted-foreground/50" />
    </div>
  );
}
