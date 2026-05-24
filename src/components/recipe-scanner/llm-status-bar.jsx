import { CheckIcon, LoaderIcon, TriangleAlertIcon } from "lucide-react";

export function LLMStatusBar({ status, progress }) {
  if (status === "idle") return null;

  const labels = {
    loading: `Downloading AI model… ${progress}%`,
    ready: "Model ready",
    extracting: "Extracting recipe…",
    error: "Model error",
    unsupported: "WebGPU not supported",
  };

  const colours = {
    loading: "text-blue-600",
    ready: "text-green-600",
    extracting: "text-amber-600",
    error: "text-red-600",
    unsupported: "text-orange-600",
  };

  return (
    <div className={`flex items-center gap-2 text-xs ${colours[status] ?? ""}`}>
      {(status === "loading" || status === "extracting") && (
        <LoaderIcon size={12} className="animate-spin shrink-0" />
      )}
      {status === "ready" && <CheckIcon size={12} className="shrink-0" />}
      {(status === "error" || status === "unsupported") && (
        <TriangleAlertIcon size={12} className="shrink-0" />
      )}
      <span>{labels[status]}</span>
      {status === "loading" && progress > 0 && (
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
