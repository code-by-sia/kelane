import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, RssIcon, TrashIcon } from "lucide-react";
import useFeedsStore from "@/store/feeds";
import { toast } from "sonner";

const SUGGESTIONS = [
  { title: "Serious Eats",     url: "https://www.seriouseats.com/feeds/all" },
  { title: "Bon Appétit",      url: "https://www.bonappetit.com/feed/rss" },
  { title: "Minimalist Baker", url: "https://minimalistbaker.com/feed/" },
  { title: "Food52",           url: "https://food52.com/blog.rss" },
  { title: "The Kitchn",       url: "https://feeds.feedburner.com/thekitchn" },
];

export default function FeedsSetup({ onNext }) {
  const feeds = useFeedsStore((s) => s.feeds);
  const addFeed = useFeedsStore((s) => s.addFeed);
  const removeFeed = useFeedsStore((s) => s.removeFeed);

  const [url, setUrl] = useState("");

  const already = (feedUrl) => feeds.some((f) => f.url === feedUrl);

  const add = (feedUrl, title = "") => {
    const trimmed = feedUrl.trim();
    if (!trimmed) return;
    if (already(trimmed)) {
      toast.info("Feed already added");
      return;
    }
    addFeed({ id: crypto.randomUUID(), url: trimmed, title: title || trimmed });
    setUrl("");
  };

  return (
    <div className="flex flex-col justify-center min-h-full max-w-2xl mx-auto gap-6">
      <div>
        <h1 className="text-2xl font-light mb-1">RSS Feeds</h1>
        <p className="text-muted-foreground text-sm">
          Subscribe to recipe blogs and food sites. New articles will appear in
          your Feeds page. You can add or remove feeds at any time.
        </p>
      </div>

      {/* Manual URL entry */}
      <div className="flex gap-2">
        <Input
          placeholder="https://example.com/feed.rss"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add(url)}
          className="flex-1"
        />
        <Button
          variant="outline"
          onClick={() => add(url)}
          disabled={!url.trim()}
        >
          <PlusIcon size={15} />
          Add
        </Button>
      </div>

      {/* Quick-add suggestions */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          Popular feeds
        </p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s.url}
              type="button"
              disabled={already(s.url)}
              onClick={() => add(s.url, s.title)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-colors
                ${already(s.url)
                  ? "border-primary/40 bg-primary/8 text-primary cursor-default"
                  : "border-border bg-card hover:bg-accent cursor-pointer"
                }`}
            >
              <RssIcon size={12} />
              {s.title}
            </button>
          ))}
        </div>
      </div>

      {/* Added feeds list */}
      {feeds.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
            Added ({feeds.length})
          </p>
          {feeds.map((feed) => (
            <div
              key={feed.id}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-card"
            >
              <RssIcon size={13} className="text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                {feed.title && feed.title !== feed.url && (
                  <p className="text-sm font-medium truncate">{feed.title}</p>
                )}
                <p className="text-xs text-muted-foreground truncate">{feed.url}</p>
              </div>
              <button
                type="button"
                onClick={() => removeFeed(feed.id)}
                className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
              >
                <TrashIcon size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onNext}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip for now
        </button>
        <Button onClick={onNext}>
          {feeds.length > 0 ? "Continue" : "Skip"}
        </Button>
      </div>
    </div>
  );
}
