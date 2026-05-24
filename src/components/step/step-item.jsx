import { cn } from "@/lib/utils";

export function Step({ title, subtitle, icon, completed = false, onClick }) {
  return (
    <div
      className={cn("step", { completed })}
      onClick={(e) => completed && onClick(e)}
    >
      <header>
        <div className="icon">{icon}</div>
        <h1>
          <span>{title}</span>
          <small>{subtitle}</small>
        </h1>
      </header>
      <div className="hidden">DATA</div>
    </div>
  );
}
