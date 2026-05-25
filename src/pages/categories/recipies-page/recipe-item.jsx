import { ClockIcon, FlameIcon, HeartIcon } from "lucide-react";
import { useNavigate, useParams } from "react-router";

export function RecipeItem({ code, name, summary, calories, prepTime, image, liked }) {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <a
      href={`/categories/${id}/${code}`}
      onClick={(e) => { e.preventDefault(); navigate(`/categories/${id}/${code}`); }}
      className="recipe-item"
    >
      {image ? (
        <img className="recipe-item__thumb" src={image} alt={name} />
      ) : (
        <div className="recipe-item__thumb-placeholder">
          <FlameIcon size={20} className="text-primary/50" strokeWidth={1} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{name}</p>
        {summary && <p className="text-xs text-muted-foreground truncate mt-0.5">{summary}</p>}
        <div className="flex gap-3 mt-1">
          {prepTime && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <ClockIcon size={10} /> {prepTime} min
            </span>
          )}
          {calories && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <FlameIcon size={10} /> {calories} kcal
            </span>
          )}
        </div>
      </div>
      {liked && <HeartIcon size={14} className="fill-red-500 stroke-red-400 shrink-0" />}
    </a>
  );
}
