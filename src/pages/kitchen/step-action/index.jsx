import { Button } from "@/components/ui/button";
import {
  PlayIcon,
  Hourglass,
  SquareIcon,
  CheckIcon,
  AlarmCheckIcon,
} from "lucide-react";
import { Timer } from "./timer";

export default function StepAction({ duration, status, dependsOn, onChange }) {
  if (status === "unknown") {
    if (dependsOn.length === 0)
      return (
        <Button className="w-24" onClick={() => onChange("START")}>
          <PlayIcon className="me-auto" /> Start
        </Button>
      );
    return (
      <Button disabled className="w-24">
        <Hourglass className="hover:animate-spin me-auto" /> Waiting...
      </Button>
    );
  }
  if (status === "in_progress") {
    if (duration > 3) {
      return (
        <Button
          className="w-24 bg-primary/85 hover:bg-primary/75"
          onClick={() => onChange("DONE")}
        >
          <AlarmCheckIcon className="me-auto" />
          <Timer duration={duration} onDone={() => onChange("DONE")} />
        </Button>
      );
    }
    return (
      <Button className="bg-orange-700 w-24" onClick={() => onChange("DONE")}>
        <SquareIcon className="me-auto" />
        Done
      </Button>
    );
  }
  if (status === "completed")
    return <CheckIcon className="stroke-green-700 me-6" />;
  return null;
}
