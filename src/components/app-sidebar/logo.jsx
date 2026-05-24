import { ChefHatIcon } from "lucide-react";

export function Logo() {
  return (
    <div className="sidebar-logo">
      <ChefHatIcon className="sidebar-logo__icon" />
      <div className="sidebar-logo__text">
        <strong className="sidebar-logo__title">Kelane</strong>
        <small className="sidebar-logo__subtitle">Recipes</small>
      </div>
    </div>
  );
}
