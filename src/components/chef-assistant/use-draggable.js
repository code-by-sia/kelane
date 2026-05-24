/**
 * useDraggable — makes the Hejar character button draggable anywhere on screen.
 *
 * - Uses Pointer Events API (works with mouse, touch, and stylus).
 * - Persists position to localStorage under CHEF_POS_KEY.
 * - Clamps to viewport on every move and on window resize.
 * - Suppresses the click event that fires after a real drag so the panel
 *   doesn't accidentally open/close.
 */
import { useCallback, useEffect, useRef, useState } from "react";

export const CHEF_POS_KEY = "chef-pos";

const DRAG_THRESHOLD = 6; // px — below this treat as a click, not a drag
const CHAR_W = 120;       // character button width  (px)
const CHAR_H = 150;       // character button height (px)

// ── Helpers ───────────────────────────────────────────────────────────────────
function defaultPos() {
  if (typeof window === "undefined") return { x: 20, y: 200 };
  const mobile = window.innerWidth < 768;
  return {
    x: window.innerWidth  - (mobile ? 16 : 24) - CHAR_W,
    y: window.innerHeight - (mobile ? 88 : 24) - CHAR_H,
  };
}

function loadPos() {
  try {
    const s = localStorage.getItem(CHEF_POS_KEY);
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

function savePos(pos) {
  try { localStorage.setItem(CHEF_POS_KEY, JSON.stringify(pos)); } catch {}
}

/** Call from the Preferences page to reset the character to its default corner. */
export function clearChefPos() {
  try { localStorage.removeItem(CHEF_POS_KEY); } catch {}
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useDraggable() {
  const [pos, setPos]           = useState(() => loadPos() ?? defaultPos());
  const [isDragging, setIsDrag] = useState(false);

  // Refs so event handlers don't need to be recreated on every render
  const posRef     = useRef(pos);
  const startCl    = useRef({ x: 0, y: 0 });
  const startPos   = useRef(pos);
  const dragging   = useRef(false);
  const hasMoved   = useRef(false);

  useEffect(() => { posRef.current = pos; }, [pos]);

  const clamp = useCallback((x, y) => ({
    x: Math.max(0, Math.min(window.innerWidth  - CHAR_W, x)),
    y: Math.max(0, Math.min(window.innerHeight - CHAR_H, y)),
  }), []);

  const onPointerDown = useCallback((e) => {
    if (e.button != null && e.button !== 0) return; // left-click / touch only
    dragging.current = true;
    hasMoved.current = false;
    startCl.current  = { x: e.clientX, y: e.clientY };
    startPos.current = posRef.current;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDrag(true);
  }, []);

  const onPointerMove = useCallback((e) => {
    if (!dragging.current) return;
    const dx = e.clientX - startCl.current.x;
    const dy = e.clientY - startCl.current.y;
    if (!hasMoved.current && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    hasMoved.current = true;
    setPos(clamp(startPos.current.x + dx, startPos.current.y + dy));
  }, [clamp]);

  const onPointerUp = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    setIsDrag(false);
    if (hasMoved.current) {
      savePos(posRef.current);
      // Capture and discard the click event that fires immediately after pointerup
      // so dragging the character doesn't accidentally open/close the panel.
      window.addEventListener("click", (e) => e.stopPropagation(), {
        capture: true,
        once: true,
      });
    }
  }, []);

  // Re-clamp if the viewport resizes (e.g. rotating mobile)
  useEffect(() => {
    const onResize = () =>
      setPos((p) => {
        const c = clamp(p.x, p.y);
        if (c.x !== p.x || c.y !== p.y) { savePos(c); return c; }
        return p;
      });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [clamp]);

  return {
    pos,
    isDragging,
    /** Spread these onto the character button element. */
    dragHandlers: { onPointerDown, onPointerMove, onPointerUp },
  };
}
