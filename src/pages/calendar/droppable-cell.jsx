import { useDroppable } from "@dnd-kit/core";

export function DroppableCell({ id, isToday, onClick, children }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <td
      ref={setNodeRef}
      className={[
        "cal-td-cell group",
        isToday ? "cal-td-cell--today" : "cal-td-cell--normal",
        isOver ? "cal-td-cell--over" : "hover:bg-muted/50",
      ].join(" ")}
      onClick={onClick}
    >
      {children}
    </td>
  );
}
