import { ClockIcon, FlameIcon, HeartIcon } from "lucide-react";
import { useNavigate, useParams } from "react-router";

export function RecipeCard({ code, name, calories, prepTime, image, liked, variants }) {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <a
      href={`/categories/${id}/${code}`}
      onClick={(e) => { e.preventDefault(); navigate(`/categories/${id}/${code}`); }}
      className="recipe-card"
    >
      {image ? (
        <img src={image} alt={name} className="aspect-[4/3] w-full object-cover" />
      ) : (
        <div className="recipe-card__placeholder">
          <FlameIcon size={40} className="text-primary/40" strokeWidth={1} />
        </div>
      )}

      <div className="recipe-card__overlay" />

      {liked && (
        <div className="recipe-card__heart">
          <HeartIcon size={16} className="fill-red-500 stroke-red-400" />
        </div>
      )}

      {variants?.length > 0 && (
        <div className="absolute top-2 left-2">
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-black/50 text-white backdrop-blur-sm">
            {variants.length} variant{variants.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      <div className="recipe-card__body">
        <p className="font-semibold text-sm leading-tight line-clamp-2">{name}</p>
        <div className="flex items-center gap-3 mt-1">
          {prepTime && (
            <span className="flex items-center gap-1 text-xs text-white/70">
              <ClockIcon size={11} />
              {prepTime} min
            </span>
          )}
          {calories && (
            <span className="flex items-center gap-1 text-xs text-white/70">
              <FlameIcon size={11} />
              {calories} kcal
            </span>
          )}
        </div>
      </div>
    </a>
  );
}
