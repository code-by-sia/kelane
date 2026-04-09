import { cn } from "@/lib/utils";
import { useMemo } from "react";
import StepAction from "./step-action";

export default function Step({ step, onStart, onDone }) {
  const canStart = step.dependsOn.length == 0 && step.status === "unknown";
  const inProgress = step.status === "in_progress";
  const badgeLabel = useMemo(() => {
    if (step.status === "in_progress") return "In Progress..";
    if (step.status === "completed") return "Completed";
    if (step.status === "unknown") {
      if (canStart) return "Not Started";
      return `Waiting on [${step.dependsOn.join(", ")}]`;
    }
    return null;
  }, [step, canStart]);

  return (
    <li key={step.id} className="flex items-center w-full">
      <strong className="flex items-center justify-center size-10 me-6">
        {step.id}
      </strong>
      <div
        className={cn(
          "p-3 rounded shadow border flex gap-2 items-center w-full",
          {
            "bg-white": canStart || inProgress,
            "animate-pulse": inProgress,
            "bg-gray-50 shadow  text-neutral-400": !canStart && !inProgress,
            "bg-green-50": step.status === "completed",
          },
        )}
      >
        <div className="flex-1 flex flex-col">
          {step.action}
          <small className="text-gray-500">{badgeLabel}</small>
        </div>

        <StepAction
          duration={step.duration}
          status={step.status}
          dependsOn={step.dependsOn}
          onChange={(change) => {
            if (change === "START") onStart(step.id);
            if (change === "DONE") onDone(step.id);
          }}
        />
      </div>
    </li>
  );
}
