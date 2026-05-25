import { KejalSVG } from "./kejal-svg";

export function ChefCharacter({ mood = "idle", onClick, isOpen, hasMessages, dragHandlers = {}, isDragging = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      {...dragHandlers}
      className={`chef-btn${isOpen ? " chef-btn--open" : ""}`}
      data-mood={mood}
      title="Chat with Kejal"
      aria-label="Chat with Kejal, your culinary assistant"
      style={{ cursor: isDragging ? "grabbing" : "pointer" }}
    >
      <div className="chef-character">
        <KejalSVG pose={moodToPose(mood)} />
      </div>
      {!isOpen && hasMessages && <span className="chef-notif-dot" aria-hidden />}
    </button>
  );
}

function moodToPose(mood) {
  switch (mood) {
    case "thinking": return "thinking";
    case "talking":  return "talking";
    case "greeting": return "greeting";
    case "excited":  return "excited";
    default:         return "idle";
  }
}
