import { useNavigate } from "react-router";
import { ChefHatIcon } from "lucide-react";
import useSetupStore from "@/store/setup";
import useRecipeStore from "@/store/recipe";
import { Button } from "@/components/ui/button";

export function SetupComplete() {
  const navigate           = useNavigate();
  const completeSetup      = useSetupStore((s) => s.completeSetup);
  const seedExampleData    = useSetupStore((s) => s.preferences.seedExampleData);
  const seedDefaultRecipes = useRecipeStore((s) => s.seedDefaultRecipes);

  const finish = () => {
    if (seedExampleData) seedDefaultRecipes();
    completeSetup();
    navigate("/");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full gap-6">
      <ChefHatIcon size={64} strokeWidth={0.8} className="text-primary" />
      <div className="text-center">
        <h1 className="text-3xl font-light mb-2">You're all set!</h1>
        <p className="text-muted-foreground">
          {seedExampleData
            ? "Kelane is ready with sample recipes. Start exploring!"
            : "Kelane is ready. Add your first recipe and start cooking."}
        </p>
      </div>
      <Button size="lg" onClick={finish}>
        Start cooking
      </Button>
    </div>
  );
}
