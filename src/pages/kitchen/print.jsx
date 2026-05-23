import { useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import useRecipeStore from "@/store/recipe";
import {
  ArrowLeftIcon,
  ClockIcon,
  FlameIcon,
  PrinterIcon,
  Users2Icon,
  SaladIcon,
} from "lucide-react";
import "./print.css";

export default function PrintPage() {
  const { recipeId } = useParams();
  const go = useNavigate();
  const getRecipe = useRecipeStore((s) => s.getRecipe);
  const recipe = useMemo(() => getRecipe(recipeId), [getRecipe, recipeId]);

  if (!recipe)
    return (
      <div className="flex items-center justify-center min-h-screen text-muted-foreground text-sm">
        Recipe not found.
      </div>
    );

  return (
    <div className="print-page">
      {/* ── Toolbar (hidden when printing) ── */}
      <div className="print-toolbar print:hidden">
        <Button variant="ghost" size="sm" onClick={() => go(-1)}>
          <ArrowLeftIcon size={15} />
          Back
        </Button>
        <span className="text-sm font-medium text-muted-foreground flex-1 text-center">
          {recipe.name}
        </span>
        <Button size="sm" onClick={() => window.print()}>
          <PrinterIcon size={15} />
          Print
        </Button>
      </div>

      {/* ── Recipe sheet ── */}
      <article className="print-article">
        {/* Header */}
        <header className="print-header">
          <h1 className="print-title">{recipe.name}</h1>
          {recipe.summary && (
            <p className="print-summary">{recipe.summary}</p>
          )}

          {/* Meta row */}
          <div className="print-meta">
            {recipe.preperationTime && (
              <span className="print-meta__item">
                <ClockIcon size={13} />
                {recipe.preperationTime} min
              </span>
            )}
            {recipe.calories && (
              <span className="print-meta__item">
                <FlameIcon size={13} />
                {recipe.calories} kcal
              </span>
            )}
            {recipe.guests && (
              <span className="print-meta__item">
                <Users2Icon size={13} />
                {recipe.guests} serving{recipe.guests !== 1 ? "s" : ""}
              </span>
            )}
            {recipe.ingredients?.length > 0 && (
              <span className="print-meta__item">
                <SaladIcon size={13} />
                {recipe.ingredients.length} ingredients
              </span>
            )}
          </div>
        </header>

        {/* Optional hero image */}
        {recipe.image && (
          <img
            src={recipe.image}
            alt={recipe.name}
            className="print-image"
          />
        )}

        {/* Two-column layout: ingredients + steps */}
        <div className="print-body">
          {/* Ingredients */}
          {recipe.ingredients?.length > 0 && (
            <section className="print-section">
              <h2 className="print-section__heading">Ingredients</h2>
              <ul className="print-ingredients">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="print-ingredient">
                    <span className="print-ingredient__dot" />
                    {ing}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Steps */}
          {recipe.steps?.length > 0 && (
            <section className="print-section print-section--steps">
              <h2 className="print-section__heading">Steps</h2>
              <ol className="print-steps">
                {recipe.steps.map((step, i) => (
                  <li key={step.id ?? i} className="print-step">
                    <span className="print-step__num">{i + 1}</span>
                    <div className="print-step__body">
                      <p className="print-step__action">{step.action}</p>
                      {step.duration && (
                        <span className="print-step__duration">
                          <ClockIcon size={10} />
                          {step.duration} min
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>

        {/* Footer */}
        <footer className="print-footer print:block hidden">
          <p>Printed from Kelane · {new Date().toLocaleDateString()}</p>
        </footer>
      </article>
    </div>
  );
}
