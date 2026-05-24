import { BookmarkXIcon, FolderOpenIcon } from "lucide-react";

export function CategoryGalleryCard({ name, count, images, isSpecial = false }) {
  const href = isSpecial ? `/uncategorized` : `/categories/${name}`;
  const imgs = images.slice(0, 4);

  return (
    <a href={href} className="cat-gallery group">
      <div className="cat-gallery__media">
        {imgs.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center">
            {isSpecial ? (
              <BookmarkXIcon size={56} className="text-muted-foreground/20" />
            ) : (
              <FolderOpenIcon size={56} className="text-muted-foreground/20" />
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
        <div className="cat-gallery__overlay" />
        <div className="cat-gallery__body">
          <p className="font-semibold text-sm leading-tight drop-shadow">{name}</p>
          <p className="text-xs text-white/70">{count} recipe{count !== 1 ? "s" : ""}</p>
        </div>
      </div>
    </a>
  );
}
