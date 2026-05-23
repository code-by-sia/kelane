import { Button } from "@/components/ui/button";
import { DatabaseIcon, CloudOffIcon } from "lucide-react";

export default function DataStorage({ onNext }) {
  return (
    <div className="flex flex-col justify-center min-h-full max-w-2xl mx-auto gap-6">
      <div>
        <h1 className="text-2xl font-light mb-1">Your data stays with you</h1>
        <p className="text-muted-foreground text-sm">
          Kelane stores everything locally in your browser — no account, no cloud, no tracking.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="flex items-start gap-4 p-5 rounded-xl border bg-card">
          <DatabaseIcon size={28} className="text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-medium mb-1">Browser localStorage</p>
            <p className="text-sm text-muted-foreground">
              All recipes, grocery lists, and meal plans are saved in your
              browser's localStorage. Data persists across sessions but is
              tied to this browser and device.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4 p-5 rounded-xl border bg-muted/40">
          <CloudOffIcon size={28} className="text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="font-medium mb-1 text-muted-foreground">Cloud sync</p>
            <p className="text-sm text-muted-foreground">
              Cloud backup and cross-device sync — coming soon.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext}>Got it</Button>
      </div>
    </div>
  );
}
