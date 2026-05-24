import { BookmarkXIcon, FolderOpenIcon } from "lucide-react";

export function CategoryMosaicCard({ name, count, images, isSpecial = false }) {
  const href = isSpecial ? `/uncategorized` : `/categories/${name}`;
  const imgs = images.slice(0, 4);

  return (
    <a href={href} className="cat-mosaic group">
      <div className="cat-mosaic__media">
        {imgs.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center">
            {isSpecial ? (
              <BookmarkXIcon size={40} className="text-muted-foreground/25" />
            ) : (
              <FolderOpenIcon size={40} className="text-muted-foreground/25" />
            )}
          </div>
        ) : imgs.length === 1 ? (
          <img src={imgs[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="cat-photo-grid">
            {imgs.map((src, i) => (
              <img key={i} src={src} alt="" className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300" />
            ))}
          </div>
        )}
      </div>

      <div className="cat-mosaic__label">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{name}</p>
          <p className="text-xs text-muted-foreground">{count} recipe{count !== 1 ? "s" : ""}</p>
        </div>
        {isSpecial && <BookmarkXIcon size={13} className="text-muted-foreground shrink-0" />}
      </div>
    </a>
  );
}
