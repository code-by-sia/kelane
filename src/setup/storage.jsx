import { DatabaseIcon, CloudOffIcon, BookOpenIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import useSetupStore from "@/store/setup";

export default function DataStorage({ onNext }) {
  const seedExampleData    = useSetupStore((s) => s.preferences.seedExampleData);
  const setSeedExampleData = useSetupStore((s) => s.setSeedExampleData);

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
            <p className="font-medium mb-1">Browser IndexedDB</p>
            <p className="text-sm text-muted-foreground">
              All recipes, grocery lists, and meal plans are saved in your
              browser's local IndexedDB. Data persists across sessions but is
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

      {/* ── Sample data ── */}
      <div>
        <h2 className="text-base font-medium mb-3">Example recipes</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Kelane ships with a small set of sample recipes so you can explore the
          app straight away. You can remove them any time.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: true,  label: "Yes, include examples",     desc: "5 sample recipes to get started" },
            { value: false, label: "No, start with a blank slate", desc: "I'll add my own recipes" },
          ].map(({ value, label, desc }) => (
            <button
              key={String(value)}
              type="button"
              onClick={() => setSeedExampleData(value)}
              className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-colors cursor-pointer ${
                seedExampleData === value
                  ? "border-primary/50 bg-primary/8"
                  : "border-border bg-card hover:bg-accent"
              }`}
            >
              <BookOpenIcon
                size={20}
                className={`shrink-0 mt-0.5 ${seedExampleData === value ? "text-primary" : "text-muted-foreground"}`}
              />
              <div>
                <p className={`text-sm font-medium ${seedExampleData === value ? "text-foreground" : "text-muted-foreground"}`}>
                  {label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext}>Got it</Button>
      </div>
    </div>
  );
}
