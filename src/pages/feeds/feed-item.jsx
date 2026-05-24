import { format } from "date-fns";
import { ExternalLinkIcon, UtensilsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FeedItem({ item, onImport }) {
  const plainDesc = item.description.replace(/<[^>]+>/g, "").trim();

  let dateStr = "";
  try {
    if (item.pubDate) dateStr = format(new Date(item.pubDate), "MMM d, yyyy");
  } catch {}

  return (
    <div className="feed-item">
      {item.image && (
        <img
          src={item.image}
          alt=""
          className="feed-item__thumb"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm leading-snug line-clamp-2">{item.title}</p>
        {plainDesc && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {plainDesc.slice(0, 200)}
          </p>
        )}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {dateStr && <span className="text-xs text-muted-foreground">{dateStr}</span>}
          <div className="ml-auto flex items-center gap-1.5">
            {item.link && (
              <Button variant="ghost" size="xs" onClick={() => window.open(item.link, "_blank")}>
                <ExternalLinkIcon size={12} />
                Open
              </Button>
            )}
            <Button size="xs" variant="outline" onClick={() => onImport(item)}>
              <UtensilsIcon size={12} />
              Import recipe
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
