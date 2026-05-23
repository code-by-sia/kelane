import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import useSetupStore from "@/store/setup";

const DIETARY_OPTIONS = [
  { id: "vegan", label: "Vegan" },
  { id: "vegetarian", label: "Vegetarian" },
  { id: "gluten-free", label: "Gluten-free" },
  { id: "dairy-free", label: "Dairy-free" },
  { id: "low-carb", label: "Low-carb" },
  { id: "nut-free", label: "Nut-free" },
  { id: "halal", label: "Halal" },
  { id: "kosher", label: "Kosher" },
];

export default function Preferences({ onNext }) {
  const dietaryTags = useSetupStore((s) => s.preferences.dietaryTags);
  const setDietaryTags = useSetupStore((s) => s.setDietaryTags);

  const toggle = (id) =>
    setDietaryTags(
      dietaryTags.includes(id)
        ? dietaryTags.filter((t) => t !== id)
        : [...dietaryTags, id],
    );

  return (
    <div className="flex flex-col justify-center min-h-full max-w-2xl mx-auto gap-6">
      <div>
        <h1 className="text-2xl font-light mb-1">Dietary preferences</h1>
        <p className="text-muted-foreground text-sm">
          Choose tags that match your diet. Kelane will use these to highlight
          suitable recipes. You can change this later in settings.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {DIETARY_OPTIONS.map(({ id, label }) => (
          <label
            key={id}
            className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
              dietaryTags.includes(id)
                ? "border-primary/50 bg-primary/8"
                : "border-border bg-card hover:bg-accent"
            }`}
          >
            <Checkbox
              checked={dietaryTags.includes(id)}
              onCheckedChange={() => toggle(id)}
            />
            <Label className="cursor-pointer font-normal">{label}</Label>
          </label>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext}>Continue</Button>
      </div>
    </div>
  );
}
