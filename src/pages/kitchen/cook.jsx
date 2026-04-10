import { Loading } from "@/components/loading";
import { useChef } from "@/hooks/chef";

import { useParams } from "react-router";
import Step from "./step";
import { useMemo } from "react";
import useRecipeStore from "@/store/recipe";

export default function CookPage() {
  const { recipeId } = useParams();
  const getRecipe = useRecipeStore((store) => store.getRecipe);
  const recipe = useMemo(() => getRecipe(recipeId), [getRecipe, recipeId]);

  const { steps, startStep, finishStep } = useChef(recipe);

  return (
    <Loading isLoading={!recipe}>
      <div className="relative flex-1 flex flex-col items-center justify-center  h-screen">
        <div
          style={{
            backgroundImage: `url('${recipe?.image}')`,
            maskImage: "linear-gradient(to up, black 60%, transparent)",
            opacity: "0.8",
          }}
          className="bg-cover w-full h-screen absolute top-0 left-0 -z-10"
        ></div>

        <div className="z-10 flex items-center flex-1 p-6   w-full">
          <section className="z-10 m-6 border p-6 rounded-xl bg-neutral-50 shadow-xl">
            <h1 className="inline-block text-3xl p-3 mb-2 font-extralight">
              {recipe?.name}
            </h1>{" "}
            <br />
            {recipe?.summary && (
              <p className="px-2 inline-block mb-6 max-w-1/2">
                {recipe?.summary}
              </p>
            )}
            {steps && (
              <ol className="flex flex-col gap-2 my-2">
                {steps.map((step) => (
                  <Step
                    key={step.id}
                    step={step}
                    onStart={() => startStep(step.id)}
                    onDone={() => finishStep(step.id)}
                  />
                ))}
              </ol>
            )}
          </section>
        </div>
      </div>
    </Loading>
  );
}
