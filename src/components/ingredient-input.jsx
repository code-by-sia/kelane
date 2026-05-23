"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { suggestIngredients } from "@/services/nutrition";

/**
 * A name <Input> that auto-suggests standardised Open Food Facts ingredient
 * names as the user types (debounced, min 2 chars).
 *
 * Selecting a suggestion fills the input with the canonical form
 * (e.g. "tomatos" → "Tomatoes", "chix" → "Chicken").
 *
 * Props mirror a controlled <Input>: value, onChange, placeholder, ...rest
 * onChange is called with a synthetic { target: { value } } object so it
 * works as a drop-in replacement wherever onChange={(e)=>setX(e.target.value)}
 * is used.
 */
export function IngredientInput({
  value,
  onChange,
  placeholder = "Ingredient name",
  ...rest
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const debounce = useRef(null);
  const containerRef = useRef(null);

  // Fetch suggestions on value change (debounced 300 ms)
  useEffect(() => {
    clearTimeout(debounce.current);
    if (!value || value.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    debounce.current = setTimeout(async () => {
      const results = await suggestIngredients(value);
      setSuggestions(results);
      setOpen(results.length > 0);
    }, 300);
    return () => clearTimeout(debounce.current);
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!containerRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const pick = useCallback(
    (name) => {
      onChange({ target: { value: name } });
      setSuggestions([]);
      setOpen(false);
    },
    [onChange],
  );

  return (
    <div ref={containerRef} className="relative">
      <Input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        {...rest}
      />
      {open && (
        <ul className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border bg-popover shadow-md py-1 max-h-52 overflow-y-auto">
          {suggestions.map((s) => (
            <li
              key={s}
              className="px-3 py-1.5 text-sm cursor-pointer hover:bg-accent transition-colors"
              onMouseDown={(e) => {
                e.preventDefault(); // Keep input focused
                pick(s);
              }}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
