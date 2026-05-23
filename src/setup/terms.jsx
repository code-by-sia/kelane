import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export default function Welcome({ onNext }) {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="flex flex-col justify-center h-full max-w-2xl mx-auto gap-6">
      <div>
        <h1 className="text-2xl font-light mb-1">Welcome to Kelane</h1>
        <p className="text-muted-foreground text-sm">
          Your personal recipe manager and meal planner. Review the terms below
          before getting started.
        </p>
      </div>

      <div className="bg-white border rounded-xl p-6 h-72 overflow-y-auto text-sm space-y-4 text-muted-foreground leading-relaxed">
        <p>
          <strong className="text-foreground">Kelane</strong> is a client-side
          recipe management application. All your data — recipes, groceries,
          meal plans — is stored locally in your browser using localStorage.
          Nothing is sent to any server.
        </p>
        <p>
          <strong className="text-foreground">Data responsibility:</strong>{" "}
          Since data lives in your browser, clearing browser data or using
          private/incognito mode may result in data loss. You are responsible
          for any backups.
        </p>
        <p>
          <strong className="text-foreground">No accounts required:</strong>{" "}
          Kelane works entirely offline. There is no login, no cloud sync, and
          no analytics.
        </p>
        <p>
          <strong className="text-foreground">Private &amp; proprietary:</strong>{" "}
          Kelane is a private application. All code, design, and content are
          proprietary. Unauthorised distribution or reproduction is not
          permitted.
        </p>
        <p>
          By continuing, you acknowledge you have read and understood the above.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            id="terms"
            checked={accepted}
            onCheckedChange={setAccepted}
          />
          <span className="text-sm">I understand and agree</span>
        </label>
        <Button disabled={!accepted} onClick={onNext}>
          Continue
        </Button>
      </div>
    </div>
  );
}
