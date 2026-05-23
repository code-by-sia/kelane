import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import useRecipeStore from "@/store/recipe";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  summary: z.string().optional(),
  image: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  calories: z.coerce.number().min(0).optional(),
  preperationTime: z.coerce.number().min(0).optional(),
  categories: z.array(z.string()).optional(),
  ingredients: z.array(z.object({ value: z.string().min(1) })),
  steps: z.array(
    z.object({
      action: z.string().min(1),
      duration: z.coerce.number().min(0).optional(),
    }),
  ),
});

function defaultValues(recipe) {
  if (!recipe) {
    return {
      name: "",
      summary: "",
      image: "",
      calories: "",
      preperationTime: "",
      categories: [],
      ingredients: [{ value: "" }],
      steps: [{ action: "", duration: "" }],
    };
  }
  return {
    name: recipe.name ?? "",
    summary: recipe.summary ?? "",
    image: recipe.image ?? "",
    calories: recipe.calories ?? "",
    preperationTime: recipe.preperationTime ?? "",
    categories: recipe.categories ?? [],
    ingredients: (recipe.ingredients ?? []).map((v) => ({ value: v })),
    steps: (recipe.steps ?? []).map((s) => ({
      action: s.action,
      duration: s.duration ?? "",
    })),
  };
}

export function RecipeFormDialog({ open, onOpenChange, recipe }) {
  const categories = useRecipeStore((s) => s.categories);
  const recipes = useRecipeStore((s) => s.recipes);
  const addRecipe = useRecipeStore((s) => s.addRecipe);
  const updateRecipe = useRecipeStore((s) => s.updateRecipe);

  // isEdit only when a full existing recipe (with code) is passed
  const isEdit = !!recipe?.code;

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues(recipe),
  });

  const {
    fields: ingFields,
    append: appendIng,
    remove: removeIng,
  } = useFieldArray({ control, name: "ingredients" });

  const {
    fields: stepFields,
    append: appendStep,
    remove: removeStep,
  } = useFieldArray({ control, name: "steps" });

  const watchedCats = watch("categories") ?? [];

  const toggleCategory = (cat) => {
    const next = watchedCats.includes(cat)
      ? watchedCats.filter((c) => c !== cat)
      : [...watchedCats, cat];
    setValue("categories", next);
  };

  const onSubmit = (data) => {
    const payload = {
      name: data.name,
      summary: data.summary || "",
      image: data.image || "",
      calories: data.calories || 0,
      preperationTime: data.preperationTime || 0,
      categories: data.categories ?? [],
      ingredients: data.ingredients.map((i) => i.value).filter(Boolean),
      steps: data.steps
        .filter((s) => s.action)
        .map((s, idx) => ({
          id: idx + 1,
          action: s.action,
          duration: s.duration || 0,
          tools: [],
          ingredients: [],
          dependsOn: [],
        })),
      date: new Date().toISOString(),
      flagged: false,
      liked: false,
      images: [],
      tools: [],
      guests: 2,
    };

    if (isEdit) {
      updateRecipe(recipe.code, payload);
    } else {
      const maxCode = recipes.reduce((m, r) => Math.max(m, r.code ?? 0), 0);
      addRecipe({ ...payload, code: maxCode + 1 });
    }

    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col gap-4">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Recipe" : "Add Recipe"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Basic info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 flex flex-col gap-1">
              <Label>Name *</Label>
              <Input placeholder="Recipe name" {...register("name")} />
              {errors.name && (
                <span className="text-xs text-destructive">
                  {errors.name.message}
                </span>
              )}
            </div>
            <div className="col-span-2 flex flex-col gap-1">
              <Label>Summary</Label>
              <Input placeholder="Short description" {...register("summary")} />
            </div>
            <div className="flex flex-col gap-1">
              <Label>Calories</Label>
              <Input
                type="number"
                min="0"
                placeholder="kcal"
                {...register("calories")}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label>Prep time (min)</Label>
              <Input
                type="number"
                min="0"
                placeholder="minutes"
                {...register("preperationTime")}
              />
            </div>
            <div className="col-span-2 flex flex-col gap-1">
              <Label>Image URL</Label>
              <Input
                placeholder="https://…"
                {...register("image")}
              />
              {errors.image && (
                <span className="text-xs text-destructive">
                  {errors.image.message}
                </span>
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-col gap-2">
            <Label>Categories</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <div key={cat} className="flex items-center gap-1.5">
                  <Checkbox
                    id={`cat-${cat}`}
                    checked={watchedCats.includes(cat)}
                    onCheckedChange={() => toggleCategory(cat)}
                  />
                  <Label htmlFor={`cat-${cat}`} className="cursor-pointer font-normal">
                    {cat}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Ingredients */}
          <div className="flex flex-col gap-2">
            <Label>Ingredients</Label>
            {ingFields.map((field, idx) => (
              <div key={field.id} className="flex gap-2 items-center">
                <Input
                  placeholder={`e.g. 500g flour`}
                  {...register(`ingredients.${idx}.value`)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeIng(idx)}
                  disabled={ingFields.length === 1}
                >
                  <Trash2Icon size={14} />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="self-start"
              onClick={() => appendIng({ value: "" })}
            >
              <PlusIcon size={14} /> Add ingredient
            </Button>
          </div>

          {/* Steps */}
          <div className="flex flex-col gap-2">
            <Label>Steps</Label>
            {stepFields.map((field, idx) => (
              <div key={field.id} className="flex gap-2 items-start">
                <span className="text-xs text-muted-foreground pt-2.5 w-5 shrink-0">
                  {idx + 1}.
                </span>
                <Input
                  placeholder="What to do…"
                  {...register(`steps.${idx}.action`)}
                />
                <Input
                  type="number"
                  min="0"
                  placeholder="min"
                  className="w-16 shrink-0"
                  {...register(`steps.${idx}.duration`)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeStep(idx)}
                  disabled={stepFields.length === 1}
                >
                  <Trash2Icon size={14} />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="self-start"
              onClick={() => appendStep({ action: "", duration: "" })}
            >
              <PlusIcon size={14} /> Add step
            </Button>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">{isEdit ? "Save changes" : "Add recipe"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
