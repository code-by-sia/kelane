import {
  AppleIcon,
  BookIcon,
  CitrusIcon,
  ClockFadingIcon,
  ClockIcon,
  CookingPotIcon,
  FlameIcon,
  LibraryBigIcon,
  MicrowaveIcon,
  NotebookIcon,
  RulerIcon,
  SaladIcon,
  Users,
  Users2,
  Users2Icon,
} from "lucide-react";
import { Button } from "./ui/button";
import { useRecipe } from "@/hooks/recipe";
import { useMemo } from "react";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router";

export function RecipeViewer({ recipeId }) {
  const go = useNavigate();
  const recipe = useRecipe(recipeId);

  if (!recipe)
    return (
      <div className="flex items-center justify-center flex-1">
        <LibraryBigIcon
          size={128}
          strokeWidth={0.4}
          className="stroke-neutral-200"
        />
      </div>
    );

  return (
    <div className="relative flex-1">
      <div
        style={{
          backgroundImage: `url('${recipe?.image}')`,
          maskImage: `linear-gradient(to bottom, black, transparent)`,
        }}
        className={`h-32 w-full bg-cover bg-center`}
      ></div>
      <h1 className="flex flex-col mb-2 mx-6 z-10 font-extralight -mt-4">
        <span className="text-3xl">{recipe?.name}</span>
      </h1>
      <div className="flex gap-2 mx-3 divide-x text-gray-600 z-10">
        <Button variant="ghost">
          <FlameIcon size={16} />
          {recipe?.calories >= 1000
            ? Math.round(recipe.calories / 1000) + " kilo"
            : recipe?.calories || "N/A"}{" "}
          calories
        </Button>
        <Button variant="ghost">
          {recipe.guests || 1} <Users2Icon size={16} />
        </Button>
        <Button variant="ghost">
          <ClockFadingIcon size={16} />
          {recipe.preperationTime} minutes
        </Button>
        <Button variant="ghost">
          <SaladIcon size={16} />
          {recipe.ingredients?.length} ingredients
        </Button>
        <Button variant="ghost">
          <MicrowaveIcon size={16} />
          {recipe.tools?.length} tools
        </Button>
      </div>
      <div className="flex gap-2 m-3 divide-x text-rose-950">
        <Button variant="outline" onClick={() => go(`/cook/${recipeId}`)}>
          <CookingPotIcon className=" stroke-rose-600" size={18} />
          Cook
        </Button>
        <Button variant="outline">
          <CitrusIcon className=" stroke-rose-600" size={18} />
          Grocories
        </Button>
        <Button variant="outline">
          <AppleIcon className=" stroke-rose-600" size={18} />
          Adjust to diet
        </Button>
        <Button variant="outline">
          <RulerIcon className=" stroke-rose-600" size={18} />
          Adjust
        </Button>
      </div>
      {/* <hr className="mx-3" />*/}
      <p className="p-3 px-5">
        <strong className="block pb-2">Summary:</strong>
        {recipe?.summary || "No description available"}
      </p>

      <div className="px-5 ">
        <strong className="block pb-2">Steps:</strong>
        <ol className="flex flex-col gap-3">
          {recipe.steps?.map((step, index) => (
            <li key={step.id} className="flex gap-2">
              <small className="p-1 font-semibold text-gray-500">
                {index + 1}
              </small>
              <span className="flex-1">{step.action}</span>
              <Badge>{step.duration}m</Badge>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
