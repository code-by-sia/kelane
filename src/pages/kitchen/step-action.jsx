import { Button } from "@/components/ui/button";
import { playDoneMelody } from "@/lib/beep";
import {
  PlayIcon,
  Hourglass,
  SquareIcon,
  CheckIcon,
  AlarmCheckIcon,
} from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";

function Timer({ duration, onDone }) {
  const [i, setI] = useState(duration);
  useEffect(() => {
    if (i > 0) {
      setTimeout(() => setI(i - 1), 1_000);
    } else {
      playDoneMelody();
      onDone();
    }
  }, [i, setI]);
  return (
    <div>
      {Math.floor(i / 60)
        .toString()
        .padStart(2, "0") +
        ":" +
        (i % 60).toString().padStart(2, "0")}
    </div>
  );
}

export default function StepAction({ duration, status, dependsOn, onChange }) {
  if (status === "unknown") {
    if (dependsOn.length === 0)
      return (
        <Button className="w-24 bg-amber-700" onClick={(_) => onChange("START")}>
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
          className="bg-orange-700 w-24"
          onClick={(_) => onChange("DONE")}
        >
          <AlarmCheckIcon className="me-auto" />
          <Timer duration={duration} onDone={(_) => onChange("DONE")} />
        </Button>
      );
    }
    return (
      <Button className="bg-orange-700 w-24" onClick={(_) => onChange("DONE")}>
        <SquareIcon className="me-auto" />
        Done
      </Button>
    );
  }
  if (status === "completed")
    return <CheckIcon className="stroke-green-700 me-6" />;
  return null;
}
