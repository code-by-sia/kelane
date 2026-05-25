/**
 * Full-page advanced recipe editor — create or edit a recipe with all schema fields.
 *
 * Routes:
 *   /recipe/new          — create mode
 *   /recipe/:code/edit   — edit mode
 */

import { useEffect, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import {
  ArrowLeftIcon,
  PlusIcon,
  Trash2Icon,
  HeartIcon,
  FlagIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  GripVerticalIcon,
  CopyPlusIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import useRecipeStore from "@/store/recipe";
import { variantSlug } from "@/lib/variants";
import "./editor.css";

// ── Zod schema ────────────────────────────────────────────────────────────────

const stepSchema = z.object({
  action:      z.string().min(1, "Step description is required"),
  duration:    z.coerce.number().min(0).optional().or(z.literal("")),
  tools:       z.array(z.string()).optional(),
  ingredients: z.array(z.string()).optional(),
  dependsOn:   z.array(z.number()).optional(),
});

const variantSchema = z.object({
  id:                  z.string().optional(),
  name:                z.string().min(1, "Variant name is required"),
  description:         z.string().optional(),
  image:               z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  calories:            z.coerce.number().min(0).optional().or(z.literal("")),
  prepTime:            z.coerce.number().min(0).optional().or(z.literal("")),
  overrideIngredients: z.boolean().optional(),
  ingredients:         z.array(z.object({ value: z.string() })).optional(),
  overrideSteps:       z.boolean().optional(),
  steps:               z.array(stepSchema).optional(),
});

const schema = z.object({
  name:            z.string().min(1, "Recipe name is required"),
  summary:         z.string().optional(),
  image:           z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  images:          z.array(z.object({ value: z.string() })).optional(),
  calories:        z.coerce.number().min(0).optional().or(z.literal("")),
  prepTime: z.coerce.number().min(0).optional().or(z.literal("")),
  servings:          z.coerce.number().min(1).optional().or(z.literal("")),
  categories:      z.array(z.string()).optional(),
  tools:           z.array(z.object({ value: z.string() })).optional(),
  ingredients:     z.array(z.object({ value: z.string().min(1, "Required") })),
  steps:           z.array(stepSchema),
  liked:           z.boolean().optional(),
  flagged:         z.boolean().optional(),
  variants:        z.array(variantSchema).optional(),
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function toFieldArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.map((v) => ({ value: typeof v === "string" ? v : String(v) })).filter((v) => v.value);
  if (typeof val === "string") return val.split(/\n|;/).map((s) => s.trim()).filter(Boolean).map((v) => ({ value: v }));
  return [];
}

function toStepArray(val) {
  if (!val) return [];
  return val.map((s) =>
    typeof s === "string"
      ? { action: s, duration: "", tools: [], ingredients: [], dependsOn: [] }
      : {
          action:      s.action ?? "",
          duration:    s.duration ?? "",
          tools:       s.tools ?? [],
          ingredients: s.ingredients ?? [],
          dependsOn:   s.dependsOn ?? [],
        }
  );
}

function toVariantArray(variants) {
  if (!variants?.length) return [];
  return variants.map((v) => ({
    id:                  v.id ?? "",
    name:                v.name ?? "",
    description:         v.description ?? "",
    image:               v.image ?? "",
    calories:            v.calories ?? "",
    prepTime:            v.prepTime ?? "",
    overrideIngredients: Boolean(v.ingredients?.length),
    ingredients:         toFieldArray(v.ingredients ?? []).length
                           ? toFieldArray(v.ingredients)
                           : [{ value: "" }],
    overrideSteps:       Boolean(v.steps?.length),
    steps:               toStepArray(v.steps ?? []).length
                           ? toStepArray(v.steps)
                           : [{ action: "", duration: "", tools: [], ingredients: [], dependsOn: [] }],
  }));
}

function buildDefaultValues(recipe) {
  if (!recipe) {
    return {
      name: "", summary: "", image: "", images: [], calories: "", prepTime: "",
      servings: "", categories: [], tools: [], liked: false, flagged: false,
      ingredients: [{ value: "" }],
      steps: [{ action: "", duration: "", tools: [], ingredients: [], dependsOn: [] }],
      variants: [],
    };
  }
  return {
    name:            recipe.name ?? "",
    summary:         recipe.summary ?? "",
    image:           recipe.image ?? "",
    images:          toFieldArray(recipe.images ?? []),
    calories:        recipe.calories ?? "",
    prepTime: recipe.prepTime ?? "",
    servings:          recipe.servings ?? "",
    categories:      recipe.categories ?? [],
    tools:           toFieldArray(recipe.tools ?? []),
    liked:           recipe.liked ?? false,
    flagged:         recipe.flagged ?? false,
    ingredients:     toFieldArray(recipe.ingredients).length
                       ? toFieldArray(recipe.ingredients)
                       : [{ value: "" }],
    steps:           toStepArray(recipe.steps).length
                       ? toStepArray(recipe.steps)
                       : [{ action: "", duration: "", tools: [], ingredients: [], dependsOn: [] }],
    variants:        toVariantArray(recipe.variants ?? []),
  };
}

// ── Sub-component: step card ──────────────────────────────────────────────────

function StepCard({ index, total, field, register, control, setValue, getValues, onRemove, onMoveUp, onMoveDown, recipeTags }) {
  const [expanded, setExpanded] = useState(false);

  const stepTools       = useWatch({ control, name: `steps.${index}.tools` }) ?? [];
  const stepIngredients = useWatch({ control, name: `steps.${index}.ingredients` }) ?? [];
  const stepDependsOn   = useWatch({ control, name: `steps.${index}.dependsOn` }) ?? [];

  const toggleTag = (field, value, current) => {
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    setValue(field, next);
  };

  return (
    <div className="re-step-card">
      {/* ── Header row ── */}
      <div className="re-step-header">
        <div className="re-step-num">{index + 1}</div>
        <Textarea
          className="re-step-action"
          placeholder="Describe this step…"
          rows={2}
          {...register(`steps.${index}.action`)}
        />
        <div className="re-step-meta">
          <Input
            type="number"
            min="0"
            placeholder="min"
            className="w-16 text-sm"
            {...register(`steps.${index}.duration`)}
          />
          <button
            type="button"
            className="re-step-icon-btn"
            onClick={() => setExpanded((v) => !v)}
            title={expanded ? "Collapse details" : "Expand details"}
          >
            {expanded ? <ChevronUpIcon size={14} /> : <ChevronDownIcon size={14} />}
          </button>
          <button type="button" className="re-step-icon-btn" onClick={onMoveUp} disabled={index === 0} title="Move up">
            <GripVerticalIcon size={14} className="rotate-90 opacity-50" />
          </button>
          <button type="button" className="re-step-icon-btn text-destructive/60 hover:text-destructive" onClick={onRemove} disabled={total === 1} title="Delete step">
            <Trash2Icon size={13} />
          </button>
        </div>
      </div>

      {/* ── Expanded details ── */}
      {expanded && (
        <div className="re-step-details">
          {/* Tools used */}
          {recipeTags.tools.length > 0 && (
            <div className="re-step-detail-row">
              <span className="re-step-detail-label">Tools</span>
              <div className="re-tag-group">
                {recipeTags.tools.map((t) => (
                  <button
                    key={t} type="button"
                    onClick={() => toggleTag(`steps.${index}.tools`, t, stepTools)}
                    className={`re-tag ${stepTools.includes(t) ? "re-tag--active" : ""}`}
                  >{t}</button>
                ))}
              </div>
            </div>
          )}

          {/* Ingredients used */}
          {recipeTags.ingredients.length > 0 && (
            <div className="re-step-detail-row">
              <span className="re-step-detail-label">Ingredients</span>
              <div className="re-tag-group">
                {recipeTags.ingredients.map((ing) => (
                  <button
                    key={ing} type="button"
                    onClick={() => toggleTag(`steps.${index}.ingredients`, ing, stepIngredients)}
                    className={`re-tag ${stepIngredients.includes(ing) ? "re-tag--active" : ""}`}
                  >{ing}</button>
                ))}
              </div>
            </div>
          )}

          {/* Depends on */}
          {index > 0 && (
            <div className="re-step-detail-row">
              <span className="re-step-detail-label">Depends on</span>
              <div className="re-tag-group">
                {Array.from({ length: index }, (_, i) => {
                  const id = i + 1;
                  const action = getValues(`steps.${i}.action`);
                  return (
                    <button
                      key={id} type="button"
                      onClick={() => toggleTag(`steps.${index}.dependsOn`, id, stepDependsOn)}
                      className={`re-tag ${stepDependsOn.includes(id) ? "re-tag--active" : ""}`}
                    >Step {id}{action ? `: ${action.slice(0, 24)}…` : ""}</button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Sub-component: variant card ───────────────────────────────────────────────

function VariantCard({ index, register, control, setValue, getValues, watch, onRemove, recipeTags }) {
  const [expanded, setExpanded] = useState(true);
  const [stepsExpanded, setStepsExpanded] = useState(false);

  const overrideIngredients = watch(`variants.${index}.overrideIngredients`);
  const overrideSteps       = watch(`variants.${index}.overrideSteps`);
  const variantName         = watch(`variants.${index}.name`) || `Variant ${index + 1}`;

  const { fields: ingFields,  append: appendIng,  remove: removeIng  } =
    useFieldArray({ control, name: `variants.${index}.ingredients` });
  const { fields: stepFields, append: appendStep, remove: removeStep } =
    useFieldArray({ control, name: `variants.${index}.steps` });

  return (
    <div className="re-variant-card">
      {/* Header */}
      <div className="re-variant-header">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-2 flex-1 text-left"
        >
          {expanded ? <ChevronUpIcon size={14} /> : <ChevronDownIcon size={14} />}
          <span className="text-sm font-medium">{variantName}</span>
        </button>
        <button
          type="button"
          className="re-step-icon-btn text-destructive/60 hover:text-destructive"
          onClick={onRemove}
          title="Remove variant"
        >
          <Trash2Icon size={13} />
        </button>
      </div>

      {expanded && (
        <div className="re-variant-body">
          {/* Name + Description row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="re-field">
              <Label>Variant name <span className="text-destructive">*</span></Label>
              <Input placeholder="e.g. Vegan, Gluten-free…" {...register(`variants.${index}.name`)} />
            </div>
            <div className="re-field">
              <Label>Description</Label>
              <Input placeholder="Short description of this variant…" {...register(`variants.${index}.description`)} />
            </div>
          </div>

          {/* Optional overrides row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="re-field">
              <Label>Calories override (kcal)</Label>
              <Input type="number" min="0" placeholder="inherit from base" {...register(`variants.${index}.calories`)} />
            </div>
            <div className="re-field">
              <Label>Prep time override (min)</Label>
              <Input type="number" min="0" placeholder="inherit from base" {...register(`variants.${index}.prepTime`)} />
            </div>
          </div>

          {/* Override image */}
          <div className="re-field">
            <Label>Image URL (optional override)</Label>
            <Input placeholder="https://… — leave blank to use base image" {...register(`variants.${index}.image`)} />
          </div>

          {/* Override ingredients toggle */}
          <div className="re-variant-override">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <Checkbox
                checked={!!overrideIngredients}
                onCheckedChange={(v) => setValue(`variants.${index}.overrideIngredients`, !!v)}
              />
              <span className="text-sm font-medium">Override ingredients</span>
              <span className="text-xs text-muted-foreground">(unchecked = inherit from base)</span>
            </label>

            {overrideIngredients && (
              <div className="flex flex-col gap-2 mt-2 pl-6">
                {ingFields.map((field, idx) => (
                  <div key={field.id} className="flex gap-2 items-center">
                    <Input
                      placeholder={`Ingredient ${idx + 1}…`}
                      {...register(`variants.${index}.ingredients.${idx}.value`)}
                    />
                    <Button
                      type="button" variant="ghost" size="icon-sm"
                      onClick={() => removeIng(idx)} disabled={ingFields.length === 1}
                    >
                      <Trash2Icon size={14} />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button" variant="outline" size="sm" className="self-start"
                  onClick={() => appendIng({ value: "" })}
                >
                  <PlusIcon size={13} /> Add ingredient
                </Button>
              </div>
            )}
          </div>

          {/* Override steps toggle */}
          <div className="re-variant-override">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <Checkbox
                checked={!!overrideSteps}
                onCheckedChange={(v) => setValue(`variants.${index}.overrideSteps`, !!v)}
              />
              <span className="text-sm font-medium">Override steps</span>
              <span className="text-xs text-muted-foreground">(unchecked = inherit from base)</span>
            </label>

            {overrideSteps && (
              <div className="flex flex-col gap-3 mt-2 pl-6">
                {stepFields.map((field, idx) => (
                  <div key={field.id} className="re-step-card">
                    <div className="re-step-header">
                      <div className="re-step-num">{idx + 1}</div>
                      <Textarea
                        className="re-step-action"
                        placeholder="Describe this step…"
                        rows={2}
                        {...register(`variants.${index}.steps.${idx}.action`)}
                      />
                      <div className="re-step-meta">
                        <Input
                          type="number" min="0" placeholder="min"
                          className="w-16 text-sm"
                          {...register(`variants.${index}.steps.${idx}.duration`)}
                        />
                        <button
                          type="button"
                          className="re-step-icon-btn text-destructive/60 hover:text-destructive"
                          onClick={() => removeStep(idx)}
                          disabled={stepFields.length === 1}
                          title="Delete step"
                        >
                          <Trash2Icon size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  type="button" variant="outline" size="sm" className="self-start"
                  onClick={() => appendStep({ action: "", duration: "", tools: [], ingredients: [], dependsOn: [] })}
                >
                  <PlusIcon size={13} /> Add step
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main editor ───────────────────────────────────────────────────────────────

export default function RecipeEditorPage() {
  const { code } = useParams();
  const navigate  = useNavigate();
  const isEdit    = Boolean(code);

  const categories  = useRecipeStore((s) => s.categories);
  const recipes     = useRecipeStore((s) => s.recipes);
  const getRecipe   = useRecipeStore((s) => s.getRecipe);
  const addRecipe   = useRecipeStore((s) => s.addRecipe);
  const updateRecipe = useRecipeStore((s) => s.updateRecipe);
  const addCategory = useRecipeStore((s) => s.addCategory);

  const recipe = isEdit ? getRecipe(code) : null;

  const { register, control, handleSubmit, watch, setValue, getValues, reset, formState: { errors, isDirty } } =
    useForm({ resolver: zodResolver(schema), defaultValues: buildDefaultValues(recipe) });

  // Re-initialise if the recipe loaded late (e.g. after IDB hydration)
  useEffect(() => {
    if (isEdit && recipe) reset(buildDefaultValues(recipe));
  }, [recipe?.code]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Field arrays ──
  const { fields: ingFields,     append: appendIng,     remove: removeIng     } = useFieldArray({ control, name: "ingredients" });
  const { fields: stepFields,    append: appendStep,    remove: removeStep    } = useFieldArray({ control, name: "steps" });
  const { fields: imgFields,     append: appendImg,     remove: removeImg     } = useFieldArray({ control, name: "images" });
  const { fields: toolFields,    append: appendTool,    remove: removeTool    } = useFieldArray({ control, name: "tools" });
  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({ control, name: "variants" });

  // Live values used for step detail pickers
  const watchedCats    = watch("categories") ?? [];
  const watchedLiked   = watch("liked") ?? false;
  const watchedFlagged = watch("flagged") ?? false;
  const watchedImage   = watch("image") ?? "";

  // Tags available inside step cards (derived from recipe-level tools/ingredients)
  const recipeTags = {
    tools:       (watch("tools") ?? []).map((t) => t.value).filter(Boolean),
    ingredients: (watch("ingredients") ?? []).map((i) => i.value).filter(Boolean),
  };

  // ── Category management ──
  const [newCatInput, setNewCatInput] = useState("");
  const toggleCategory = (cat) => {
    const next = watchedCats.includes(cat)
      ? watchedCats.filter((c) => c !== cat)
      : [...watchedCats, cat];
    setValue("categories", next);
  };
  const handleAddCategory = () => {
    const cat = newCatInput.trim();
    if (!cat) return;
    addCategory(cat);
    setValue("categories", [...watchedCats, cat]);
    setNewCatInput("");
  };

  // ── Step reordering ──
  const moveStep = (from, to) => {
    const current = getValues("steps");
    const updated = [...current];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setValue("steps", updated);
  };

  // ── Submit ──
  const onSubmit = (data) => {
    const serializeSteps = (steps) =>
      (steps ?? [])
        .filter((s) => s.action)
        .map((s, idx) => ({
          id:          idx + 1,
          action:      s.action,
          duration:    s.duration ? Number(s.duration) : 0,
          tools:       s.tools ?? [],
          ingredients: s.ingredients ?? [],
          dependsOn:   s.dependsOn ?? [],
        }));

    const payload = {
      name:            data.name,
      summary:         data.summary || "",
      image:           data.image || "",
      images:          (data.images ?? []).map((i) => i.value).filter(Boolean),
      calories:        data.calories ? Number(data.calories) : 0,
      prepTime: data.prepTime ? Number(data.prepTime) : 0,
      servings:          data.servings ? Number(data.servings) : 2,
      categories:      data.categories ?? [],
      tools:           (data.tools ?? []).map((t) => t.value).filter(Boolean),
      liked:           data.liked ?? false,
      flagged:         data.flagged ?? false,
      ingredients:     data.ingredients.map((i) => i.value).filter(Boolean),
      steps:           serializeSteps(data.steps),
      date: isEdit ? (recipe.date ?? new Date().toISOString()) : new Date().toISOString(),
      variants: (data.variants ?? [])
        .filter((v) => v.name?.trim())
        .map((v) => {
          const id = v.id || variantSlug(v.name);
          const variant = { id, name: v.name.trim() };
          if (v.description?.trim()) variant.description = v.description.trim();
          if (v.image?.trim())       variant.image = v.image.trim();
          if (v.calories !== "")     variant.calories = Number(v.calories);
          if (v.prepTime !== "")     variant.prepTime = Number(v.prepTime);
          if (v.overrideIngredients) {
            const ings = (v.ingredients ?? []).map((i) => i.value).filter(Boolean);
            if (ings.length) variant.ingredients = ings;
          }
          if (v.overrideSteps) {
            const steps = serializeSteps(v.steps);
            if (steps.length) variant.steps = steps;
          }
          return variant;
        }),
    };

    if (isEdit) {
      updateRecipe(code, payload);
      toast.success("Recipe saved");
      navigate(-1);
    } else {
      addRecipe({ ...payload, code: crypto.randomUUID() });
      toast.success("Recipe added");
      navigate(-1);
    }
  };

  if (isEdit && !recipe) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 text-muted-foreground">
        <p>Recipe not found.</p>
        <Button variant="outline" onClick={() => navigate(-1)}>Go back</Button>
      </div>
    );
  }

  return (
    <div className="re-page">
      {/* ── Sticky header ── */}
      <header className="re-header">
        <button type="button" className="re-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeftIcon size={16} />
        </button>
        <h1 className="re-title">{isEdit ? "Edit recipe" : "New recipe"}</h1>
        <div className="flex items-center gap-2 ml-auto">
          <Button type="button" variant="ghost" size="sm" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="button" size="sm" onClick={handleSubmit(onSubmit)}>
            {isEdit ? "Save changes" : "Add recipe"}
          </Button>
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="re-body">

        {/* ══ Section: Basics ══════════════════════════════════════════════════ */}
        <section className="re-section">
          <h2 className="re-section-title">Basic info</h2>

          <div className="re-field">
            <Label>Name <span className="text-destructive">*</span></Label>
            <Input placeholder="e.g. Classic Margherita Pizza" {...register("name")} />
            {errors.name && <p className="re-error">{errors.name.message}</p>}
          </div>

          <div className="re-field">
            <Label>Summary</Label>
            <Textarea
              placeholder="A short description of the recipe…"
              rows={2}
              {...register("summary")}
            />
          </div>

          {/* Metrics row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="re-field">
              <Label>Calories (kcal)</Label>
              <Input type="number" min="0" placeholder="800" {...register("calories")} />
            </div>
            <div className="re-field">
              <Label>Prep time (min)</Label>
              <Input type="number" min="0" placeholder="30" {...register("prepTime")} />
            </div>
            <div className="re-field">
              <Label>Servings</Label>
              <Input type="number" min="1" placeholder="4" {...register("servings")} />
            </div>
          </div>

          {/* Flags */}
          <div className="flex gap-4">
            <label className={`re-flag-btn ${watchedLiked ? "re-flag-btn--on" : ""}`}>
              <Checkbox checked={watchedLiked} onCheckedChange={(v) => setValue("liked", !!v)} />
              <HeartIcon size={14} className={watchedLiked ? "text-rose-500" : "text-muted-foreground"} />
              <span className="text-sm">Favourite</span>
            </label>
            <label className={`re-flag-btn ${watchedFlagged ? "re-flag-btn--on" : ""}`}>
              <Checkbox checked={watchedFlagged} onCheckedChange={(v) => setValue("flagged", !!v)} />
              <FlagIcon size={14} className={watchedFlagged ? "text-amber-500" : "text-muted-foreground"} />
              <span className="text-sm">Flagged</span>
            </label>
          </div>
        </section>

        <Separator />

        {/* ══ Section: Images ══════════════════════════════════════════════════ */}
        <section className="re-section">
          <h2 className="re-section-title">Images</h2>

          <div className="re-field">
            <Label>Primary image URL</Label>
            <Input placeholder="https://…" {...register("image")} />
            {errors.image && <p className="re-error">{errors.image.message}</p>}
            {watchedImage && (
              <img
                src={watchedImage}
                alt="Preview"
                className="mt-2 h-40 w-full object-cover rounded-lg border"
                onError={(e) => (e.target.style.display = "none")}
                onLoad={(e) => (e.target.style.display = "block")}
              />
            )}
          </div>

          <div className="re-field">
            <Label>Additional images</Label>
            <div className="flex flex-col gap-2">
              {imgFields.map((field, idx) => (
                <div key={field.id} className="flex gap-2">
                  <Input placeholder="https://…" {...register(`images.${idx}.value`)} />
                  <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeImg(idx)}>
                    <Trash2Icon size={14} />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="self-start"
                onClick={() => appendImg({ value: "" })}>
                <PlusIcon size={13} /> Add image URL
              </Button>
            </div>
          </div>
        </section>

        <Separator />

        {/* ══ Section: Categories ══════════════════════════════════════════════ */}
        <section className="re-section">
          <h2 className="re-section-title">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`re-cat-chip ${watchedCats.includes(cat) ? "re-cat-chip--active" : ""}`}
              >{cat}</button>
            ))}
          </div>
          <div className="flex gap-2 mt-1">
            <Input
              placeholder="New category…"
              value={newCatInput}
              onChange={(e) => setNewCatInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddCategory(); } }}
              className="max-w-48"
            />
            <Button type="button" variant="outline" size="sm" onClick={handleAddCategory}>
              <PlusIcon size={13} /> Add
            </Button>
          </div>
        </section>

        <Separator />

        {/* ══ Section: Tools ═══════════════════════════════════════════════════ */}
        <section className="re-section">
          <h2 className="re-section-title">Kitchen tools</h2>
          <p className="re-hint">Tools required for this recipe (e.g. Mixing bowl, Oven).</p>
          <div className="flex flex-col gap-2">
            {toolFields.map((field, idx) => (
              <div key={field.id} className="flex gap-2 items-center">
                <Input placeholder="e.g. Oven" {...register(`tools.${idx}.value`)} />
                <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeTool(idx)}>
                  <Trash2Icon size={14} />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="self-start"
              onClick={() => appendTool({ value: "" })}>
              <PlusIcon size={13} /> Add tool
            </Button>
          </div>
        </section>

        <Separator />

        {/* ══ Section: Ingredients ═════════════════════════════════════════════ */}
        <section className="re-section">
          <h2 className="re-section-title">Ingredients</h2>
          <p className="re-hint">One ingredient per line. Include quantity and unit (e.g. 500g flour).</p>
          <div className="flex flex-col gap-2">
            {ingFields.map((field, idx) => (
              <div key={field.id} className="flex gap-2 items-center">
                <Input
                  placeholder={`e.g. ${["500g flour", "2 tbsp olive oil", "3 cloves garlic"][idx % 3]}`}
                  {...register(`ingredients.${idx}.value`)}
                />
                <Button
                  type="button" variant="ghost" size="icon-sm"
                  onClick={() => removeIng(idx)} disabled={ingFields.length === 1}
                >
                  <Trash2Icon size={14} />
                </Button>
              </div>
            ))}
            {errors.ingredients && <p className="re-error">At least one ingredient is required</p>}
            <Button type="button" variant="outline" size="sm" className="self-start"
              onClick={() => appendIng({ value: "" })}>
              <PlusIcon size={13} /> Add ingredient
            </Button>
          </div>
        </section>

        <Separator />

        {/* ══ Section: Steps ═══════════════════════════════════════════════════ */}
        <section className="re-section">
          <h2 className="re-section-title">Cooking steps</h2>
          <p className="re-hint">
            Each step can reference which tools and ingredients it uses. Expand a step to set dependencies.
          </p>
          <div className="flex flex-col gap-3">
            {stepFields.map((field, idx) => (
              <StepCard
                key={field.id}
                index={idx}
                total={stepFields.length}
                field={field}
                register={register}
                control={control}
                setValue={setValue}
                getValues={getValues}
                onRemove={() => removeStep(idx)}
                onMoveUp={() => moveStep(idx, idx - 1)}
                onMoveDown={() => moveStep(idx, idx + 1)}
                recipeTags={recipeTags}
              />
            ))}
            <Button type="button" variant="outline" size="sm" className="self-start"
              onClick={() => appendStep({ action: "", duration: "", tools: [], ingredients: [], dependsOn: [] })}>
              <PlusIcon size={13} /> Add step
            </Button>
          </div>
        </section>

        <Separator />

        {/* ══ Section: Variants ════════════════════════════════════════════════ */}
        <section className="re-section">
          <h2 className="re-section-title">Variants</h2>
          <p className="re-hint">
            Add alternate versions of this recipe (e.g. Vegan, Gluten-free, Spicy). Each variant can
            override any combination of ingredients, steps, calories, or prep time while keeping everything
            else from the base recipe.
          </p>

          <div className="flex flex-col gap-3">
            {variantFields.map((field, idx) => (
              <VariantCard
                key={field.id}
                index={idx}
                register={register}
                control={control}
                setValue={setValue}
                getValues={getValues}
                watch={watch}
                onRemove={() => removeVariant(idx)}
                recipeTags={recipeTags}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="self-start"
              onClick={() =>
                appendVariant({
                  id: "",
                  name: "",
                  description: "",
                  image: "",
                  calories: "",
                  prepTime: "",
                  overrideIngredients: false,
                  ingredients: [{ value: "" }],
                  overrideSteps: false,
                  steps: [{ action: "", duration: "", tools: [], ingredients: [], dependsOn: [] }],
                })
              }
            >
              <CopyPlusIcon size={13} /> Add variant
            </Button>
          </div>
        </section>

        {/* Bottom save bar */}
        <div className="re-bottom-bar">
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit">{isEdit ? "Save changes" : "Add recipe"}</Button>
        </div>

      </form>
    </div>
  );
}
