import { HEjarSVG } from "./hejar-svg";

export function ChefCharacter({ mood = "idle", onClick, isOpen, hasMessages }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`chef-btn${isOpen ? " chef-btn--open" : ""}`}
      data-mood={mood}
      title={isOpen ? "Close Hejar" : "Chat with Hejar"}
      aria-label={isOpen ? "Close assistant" : "Chat with Hejar, your culinary assistant"}
    >
      <div className="chef-character">
        <HEjarSVG pose={moodToPose(mood)} />
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
