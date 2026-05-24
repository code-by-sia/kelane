import { cn } from "@/lib/utils";
import { TimerIcon } from "lucide-react";

const RING_R = 46;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_R;

export function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export function TimerRing({ total, remaining }) {
  const progress = total > 0 ? remaining / total : 0;
  const dashOffset = RING_CIRCUMFERENCE * (1 - progress);
  const urgent = remaining <= 30 && remaining > 0;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90" aria-hidden="true">
        <circle
          cx="60" cy="60" r={RING_R}
          fill="none" stroke="currentColor" strokeWidth="7"
          className="text-muted-foreground/15"
        />
        <circle
          cx="60" cy="60" r={RING_R}
          fill="none" stroke="currentColor" strokeWidth="7"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          className={cn("transition-all duration-1000", urgent ? "text-destructive" : "text-primary")}
        />
      </svg>
      <div className="absolute flex flex-col items-center rotate-0">
        <TimerIcon size={14} className={cn("mb-0.5", urgent ? "text-destructive" : "text-muted-foreground")} />
        <span className={cn("text-2xl font-mono font-bold tabular-nums leading-none", urgent ? "text-destructive" : "text-foreground")}>
          {formatTime(remaining)}
        </span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">left</span>
      </div>
    </div>
  );
}
