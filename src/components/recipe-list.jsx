import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";

export function RecipeList({ recipes, onSelect = (code) => { } }) {
  return (
    <div className="flex w-full max-w-md flex-col gap-6 p-6">
      <ItemGroup className=" gap-2">
        {recipes.map((recipe) => (
          <Item key={recipe.code}  asChild role="listitem" onClick={() => onSelect(recipe.code)}>
            <a href="#">
              <ItemMedia >
                <img
                  src={recipe.image}
                  alt={recipe.name}
                  width={128}
                  height={128}
                  className="object-cover rounded-lg"
                />
              </ItemMedia>
              <ItemContent>
                <ItemTitle className="flex flex-col">
                  <h1 className="w-full">{recipe.name}</h1>
                  <span className="text-muted-foreground font-extralight">{recipe.summary}</span>
                </ItemTitle>
                <ItemDescription>{recipe.description}</ItemDescription>
              </ItemContent>
              <ItemContent className="flex-none text-center">
                <ItemDescription>{recipe.duration}</ItemDescription>
              </ItemContent>
            </a>
          </Item>
        ))}
      </ItemGroup>
    </div>
  );
}
