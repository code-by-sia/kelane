import { BookmarkXIcon, FolderOpenIcon } from "lucide-react";

export function CategoryListRow({ name, count, images, isSpecial = false }) {
  const href = isSpecial ? `/uncategorized` : `/categories/${name}`;
  const imgs = images.slice(0, 4);

  return (
    <a href={href} className="cat-list-row">
      <div className="shrink-0 w-20 flex items-center">
        {imgs.length === 0 ? (
          isSpecial ? (
            <BookmarkXIcon size={20} className="text-muted-foreground" />
          ) : (
            <FolderOpenIcon size={20} className="text-muted-foreground" />
          )
        ) : (
          <div className="cat-list-row__avatars">
            {imgs.map((src, i) => (
              <img key={i} src={src} alt="" className="cat-list-row__avatar" style={{ zIndex: imgs.length - i }} />
            ))}
          </div>
        )}
      </div>
      <span className="flex-1 text-sm font-medium">{name}</span>
      <span className="text-xs text-muted-foreground tabular-nums shrink-0">
        {count} recipe{count !== 1 ? "s" : ""}
      </span>
    </a>
  );
}
