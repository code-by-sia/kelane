import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { format } from "date-fns";
import {
  BookMarkedIcon,
  ExternalLinkIcon,
  LoaderIcon,
  PlusIcon,
  RefreshCwIcon,
  RssIcon,
  TrashIcon,
  TriangleAlertIcon,
  UtensilsIcon,
} from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import SidebarPage from "@/pages/sidebar-page";
import { RecipeFormDialog } from "@/components/recipe-form";
import useFeedsStore from "@/store/feeds";

// ── RSS / Atom parser ──────────────────────────────────────────────────────
function parseXML(xmlText) {
  const doc = new DOMParser().parseFromString(xmlText, "text/xml");
  const isAtom = !!doc.querySelector("feed");

  const get = (el, sel) => el.querySelector(sel)?.textContent?.trim() ?? "";
  const getAttr = (el, sel, attr) =>
    el.querySelector(sel)?.getAttribute(attr) ?? null;

  const itemSel = isAtom ? "entry" : "item";
  const items = [...doc.querySelectorAll(itemSel)].map((el) => {
    const link = isAtom
      ? getAttr(el, "link[rel=alternate]", "href") ||
        getAttr(el, "link", "href") ||
        get(el, "link")
      : get(el, "link");

    const image =
      getAttr(el, "media\\:content[medium=image]", "url") ||
      getAttr(el, "media\\:content", "url") ||
      getAttr(el, "media\\:thumbnail", "url") ||
      getAttr(el, "enclosure[type^=image]", "url") ||
      null;

    return {
      title: get(el, "title"),
      description: get(el, isAtom ? "summary" : "description"),
      link,
      pubDate: get(el, isAtom ? "published" : "pubDate"),
      image,
    };
  });

  const channelTitle =
    doc
      .querySelector(isAtom ? "feed > title" : "channel > title")
      ?.textContent?.trim() ?? "";

  return { items, channelTitle };
}

async function fetchFeed(url) {
  // Direct fetch first
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    return { ...parseXML(text), viaCorsProxy: false };
  } catch {
    // CORS fallback via corsproxy.io
    const proxied = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    const res = await fetch(proxied, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`Proxy returned ${res.status}`);
    const text = await res.text();
    return { ...parseXML(text), viaCorsProxy: true };
  }
}

// ── Feed item ──────────────────────────────────────────────────────────────
function FeedItem({ item, onImport }) {
  const plainDesc = item.description.replace(/<[^>]+>/g, "").trim();

  let dateStr = "";
  try {
    if (item.pubDate) dateStr = format(new Date(item.pubDate), "MMM d, yyyy");
  } catch {}

  return (
    <div className="flex gap-3 p-4 border-b last:border-b-0 hover:bg-accent/30 transition-colors">
      {item.image && (
        <img
          src={item.image}
          alt=""
          className="w-20 h-20 rounded-lg object-cover shrink-0 bg-muted"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm leading-snug line-clamp-2">
          {item.title}
        </p>
        {plainDesc && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {plainDesc.slice(0, 200)}
          </p>
        )}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {dateStr && (
            <span className="text-xs text-muted-foreground">{dateStr}</span>
          )}
          <div className="ml-auto flex items-center gap-1.5">
            {item.link && (
              <Button
                variant="ghost"
                size="xs"
                onClick={() => window.open(item.link, "_blank")}
              >
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

// ── Add feed inline form ───────────────────────────────────────────────────
function AddFeedForm({ onAdd, onCancel }) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;
    setLoading(true);
    try {
      const { channelTitle } = await fetchFeed(trimmedUrl);
      onAdd({
        url: trimmedUrl,
        title: title.trim() || channelTitle || trimmedUrl,
      });
    } catch {
      toast.error("Could not reach that feed — check the URL and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-3 border-t bg-muted/30">
      <Input
        placeholder="Feed URL (RSS or Atom)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        className="h-8 text-sm"
        autoFocus
      />
      <Input
        placeholder="Title (auto-detected if blank)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="h-8 text-sm"
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          className="flex-1"
          disabled={!url.trim() || loading}
          onClick={handleAdd}
        >
          {loading ? (
            <LoaderIcon size={13} className="animate-spin" />
          ) : (
            <PlusIcon size={13} />
          )}
          Add Feed
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function FeedsPage() {
  const { feedId } = useParams();
  const navigate = useNavigate();

  const feeds = useFeedsStore((s) => s.feeds);
  const addFeed = useFeedsStore((s) => s.addFeed);
  const removeFeed = useFeedsStore((s) => s.removeFeed);

  const selectedFeed = feeds.find((f) => f.id === feedId) ?? null;

  const [items, setItems] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [feedError, setFeedError] = useState(null);
  const [viaCorsProxy, setViaCorsProxy] = useState(false);
  const [addingFeed, setAddingFeed] = useState(false);
  const [importItem, setImportItem] = useState(null);

  // Pre-fill for RecipeFormDialog when importing
  const importRecipeDefaults = useMemo(() => {
    if (!importItem) return null;
    return {
      name: importItem.title,
      summary: importItem.description.replace(/<[^>]+>/g, "").slice(0, 500),
      image: importItem.image ?? "",
    };
  }, [importItem]);

  const loadFeed = useCallback(async (feed) => {
    if (!feed) return;
    setLoadingFeed(true);
    setFeedError(null);
    setItems([]);
    setViaCorsProxy(false);
    try {
      const result = await fetchFeed(feed.url);
      setItems(result.items);
      setViaCorsProxy(result.viaCorsProxy);
    } catch (e) {
      setFeedError(e?.message ?? "Failed to load feed.");
    } finally {
      setLoadingFeed(false);
    }
  }, []);

  // Auto-navigate to first feed when no feedId
  useEffect(() => {
    if (!feedId && feeds.length > 0) {
      navigate(`/feeds/${feeds[0].id}`, { replace: true });
    }
  }, [feedId, feeds, navigate]);

  // Load whenever selected feed changes
  useEffect(() => {
    if (selectedFeed) loadFeed(selectedFeed);
  }, [selectedFeed?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddFeed = ({ url, title }) => {
    const id = crypto.randomUUID();
    addFeed({ id, url, title });
    setAddingFeed(false);
    navigate(`/feeds/${id}`);
  };

  const handleRemoveFeed = (id) => {
    removeFeed(id);
    if (selectedFeed?.id === id) {
      const remaining = feeds.filter((f) => f.id !== id);
      navigate(remaining.length > 0 ? `/feeds/${remaining[0].id}` : "/feeds", {
        replace: true,
      });
    }
  };

  return (
    <SidebarPage title="Feeds">
      <ResizablePanelGroup orientation="horizontal" className="flex-1 overflow-hidden">
        {/* ── Left: feed list ─────────────────────────────────────── */}
        <ResizablePanel
          defaultSize={28}
          minSize={20}
          maxSize={50}
          className="flex flex-col"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              My Feeds
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setAddingFeed((v) => !v)}
              title="Add feed"
            >
              <PlusIcon size={14} />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {feeds.map((feed) => (
              <div
                key={feed.id}
                className={`group flex items-center gap-2 px-4 py-2.5 cursor-pointer hover:bg-accent transition-colors border-b last:border-b-0 ${
                  selectedFeed?.id === feed.id ? "bg-accent" : ""
                }`}
                onClick={() => navigate(`/feeds/${feed.id}`)}
              >
                <RssIcon size={13} className="shrink-0 text-orange-500" />
                <span className="flex-1 text-sm truncate">{feed.title}</span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFeed(feed.id);
                  }}
                  title="Remove feed"
                >
                  <TrashIcon size={13} />
                </Button>
              </div>
            ))}

            {feeds.length === 0 && !addingFeed && (
              <div className="flex flex-col items-center gap-2 py-10 px-4 text-center">
                <RssIcon
                  size={28}
                  strokeWidth={0.8}
                  className="text-muted-foreground/40"
                />
                <p className="text-xs text-muted-foreground">
                  No feeds yet — add one to get started.
                </p>
              </div>
            )}
          </div>

          {addingFeed && (
            <AddFeedForm
              onAdd={handleAddFeed}
              onCancel={() => setAddingFeed(false)}
            />
          )}
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* ── Right: feed items ────────────────────────────────────── */}
        <ResizablePanel defaultSize={72} minSize={40} className="flex flex-col">
          {selectedFeed ? (
            <>
              {/* Feed header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b shrink-0">
                <RssIcon size={14} className="text-orange-500 shrink-0" />
                <span className="font-medium text-sm truncate">
                  {selectedFeed.title}
                </span>
                {viaCorsProxy && (
                  <Badge
                    variant="outline"
                    className="text-xs text-amber-700 border-amber-300 shrink-0"
                  >
                    via CORS proxy
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="ml-auto shrink-0"
                  onClick={() => loadFeed(selectedFeed)}
                  title="Refresh feed"
                  disabled={loadingFeed}
                >
                  <RefreshCwIcon
                    size={13}
                    className={loadingFeed ? "animate-spin" : ""}
                  />
                </Button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto">
                {loadingFeed && (
                  <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
                    <LoaderIcon size={20} className="animate-spin" />
                    <span className="text-sm">Loading feed…</span>
                  </div>
                )}

                {feedError && !loadingFeed && (
                  <div className="flex flex-col items-center gap-3 py-16 text-center px-6">
                    <TriangleAlertIcon
                      size={32}
                      strokeWidth={0.8}
                      className="text-amber-400"
                    />
                    <p className="font-medium text-sm">Could not load feed</p>
                    <p className="text-xs text-muted-foreground max-w-xs">
                      {feedError}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => loadFeed(selectedFeed)}
                    >
                      Try again
                    </Button>
                  </div>
                )}

                {!loadingFeed && !feedError && items.length === 0 && (
                  <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground text-center">
                    <BookMarkedIcon size={28} strokeWidth={0.7} />
                    <p className="text-sm">No items found in this feed.</p>
                  </div>
                )}

                {!loadingFeed &&
                  items.map((item, i) => (
                    <FeedItem
                      key={`${item.link}-${i}`}
                      item={item}
                      onImport={setImportItem}
                    />
                  ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <RssIcon size={48} strokeWidth={0.5} />
              <p className="text-sm">Select a feed or add one to get started.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddingFeed(true)}
              >
                <PlusIcon size={14} />
                Add Feed
              </Button>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Recipe import dialog */}
      <RecipeFormDialog
        open={!!importItem}
        onOpenChange={(open) => !open && setImportItem(null)}
        recipe={importRecipeDefaults}
      />
    </SidebarPage>
  );
}
