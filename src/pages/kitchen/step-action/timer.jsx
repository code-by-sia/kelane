import { useEffect, useState } from "react";
import { playDoneMelody } from "@/lib/beep";

export function Timer({ duration, onDone }) {
  const [i, setI] = useState(duration);

  useEffect(() => {
    if (i > 0) {
      setTimeout(() => setI(i - 1), 1_000);
    } else {
      playDoneMelody();
      onDone();
    }
  }, [i, setI]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      {Math.floor(i / 60).toString().padStart(2, "0") +
        ":" +
        (i % 60).toString().padStart(2, "0")}
    </div>
  );
}
