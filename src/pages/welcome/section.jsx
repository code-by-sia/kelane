import { Badge } from "@/components/ui/badge";
import { SuggestCard } from "./suggest-card";

export function Section({ icon: Icon, iconClass, title, badge, subtitle, recipes, fridgeItems, chips = {} }) {
  if (recipes.length === 0) return null;
  return (
    <section className="home-section">
      <div className="flex items-center gap-2 flex-wrap">
        {Icon && <Icon size={14} className={iconClass ?? "text-muted-foreground"} />}
        <h2 className="home-section__heading">
          {title}
          {badge !== undefined && (
            <Badge variant="outline" className={`ml-2 text-xs font-normal normal-case tracking-normal ${typeof badge === "object" ? badge.className ?? "" : ""}`}>
              {typeof badge === "object" ? badge.label : badge}
            </Badge>
          )}
        </h2>
      </div>
      {subtitle && <p className="text-xs text-muted-foreground -mt-1">{subtitle}</p>}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {recipes.map((r) => (
          <SuggestCard key={r.code} recipe={r} fridgeItems={fridgeItems} chip={chips[r.code]} />
        ))}
      </div>
    </section>
  );
}
