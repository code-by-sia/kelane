import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowLeftIcon } from "lucide-react";
import {
  BookMarkedIcon,
  LoaderIcon,
  PlusIcon,
  RefreshCwIcon,
  RssIcon,
  ShieldOffIcon,
  TrashIcon,
  TriangleAlertIcon,
} from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input as InputUI } from "@/components/ui/input";
import SidebarPage from "@/pages/sidebar-page";
import { RecipeFormDialog } from "@/components/recipe-form";
import useFeedsStore from "@/store/feeds";
import "./feeds.css";
import useSettingsStore, { PROXY_PRESETS, getProxyPrefix } from "@/store/settings";
import { fetchDirect, fetchViaProxy } from "./utils";
import { FeedItem } from "./feed-item";
import { AddFeedForm } from "./add-feed-form";

export default function FeedsPage() {
  const { feedId } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const feeds = useFeedsStore((s) => s.feeds);
  const addFeed = useFeedsStore((s) => s.addFeed);
  const removeFeed = useFeedsStore((s) => s.removeFeed);

  const settingsState = useSettingsStore();
  const proxyPresetId = useSettingsStore((s) => s.proxyPresetId);
  const customProxyPrefix = useSettingsStore((s) => s.customProxyPrefix);
  const setProxyPreset = useSettingsStore((s) => s.setProxyPreset);
  const setCustomProxyPrefix = useSettingsStore((s) => s.setCustomProxyPrefix);
  const proxyPrefix = getProxyPrefix(settingsState);
  const activePreset = PROXY_PRESETS.find((p) => p.id === proxyPresetId) ?? PROXY_PRESETS[0];

  const selectedFeed = feeds.find((f) => f.id === feedId) ?? null;

  const [items, setItems] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [feedError, setFeedError] = useState(null);
  const [corsBlocked, setCorsBlocked] = useState(false);
  const [viaCorsProxy, setViaCorsProxy] = useState(false);
  const [addingFeed, setAddingFeed] = useState(false);
  const [importItem, setImportItem] = useState(null);

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
    setCorsBlocked(false);
    setItems([]);
    setViaCorsProxy(false);
    try {
      const result = await fetchDirect(feed.url);
      setItems(result.items);
    } catch (e) {
      setCorsBlocked(true);
      setFeedError(e?.message ?? "Network error");
    } finally {
      setLoadingFeed(false);
    }
  }, []);

  const retryWithProxy = useCallback(async () => {
    if (!selectedFeed) return;
    setLoadingFeed(true);
    setFeedError(null);
    setCorsBlocked(false);
    setItems([]);
    try {
      const result = await fetchViaProxy(selectedFeed.url, proxyPrefix);
      setItems(result.items);
      setViaCorsProxy(true);
    } catch (e) {
      setFeedError(e?.message ?? "Proxy request failed");
    } finally {
      setLoadingFeed(false);
    }
  }, [selectedFeed, proxyPrefix]);

  useEffect(() => {
    if (!feedId && feeds.length > 0 && !isMobile) {
      navigate(`/feeds/${feeds[0].id}`, { replace: true });
    }
  }, [feedId, feeds, navigate, isMobile]);

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
      navigate(remaining.length > 0 ? `/feeds/${remaining[0].id}` : "/feeds", { replace: true });
    }
  };

  const FeedListPanel = ({ className = "" }) => (
    <div className={`flex flex-col min-h-0 ${className}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">My Feeds</span>
        <Button variant="ghost" size="icon-sm" onClick={() => setAddingFeed((v) => !v)} title="Add feed">
          <PlusIcon size={14} />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {feeds.map((feed) => (
          <div
            key={feed.id}
            className={`feed-list-item group ${selectedFeed?.id === feed.id ? "feed-list-item--active" : ""}`}
            onClick={() => navigate(`/feeds/${feed.id}`)}
          >
            <RssIcon size={13} className="shrink-0 text-primary" />
            <span className="flex-1 text-sm truncate">{feed.title}</span>
            <Button
              variant="ghost"
              size="icon-sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
              onClick={(e) => { e.stopPropagation(); handleRemoveFeed(feed.id); }}
              title="Remove feed"
            >
              <TrashIcon size={13} />
            </Button>
          </div>
        ))}
        {feeds.length === 0 && !addingFeed && (
          <div className="flex flex-col items-center gap-2 py-10 px-4 text-center">
            <RssIcon size={28} strokeWidth={0.8} className="text-muted-foreground/40" />
            <p className="text-xs text-muted-foreground">No feeds yet — add one to get started.</p>
          </div>
        )}
      </div>
      {addingFeed && <AddFeedForm onAdd={handleAddFeed} onCancel={() => setAddingFeed(false)} />}
    </div>
  );

  const FeedItemsPanel = ({ showBack = false, className = "" }) => (
    <div className={`flex flex-col min-h-0 ${className}`}>
      {selectedFeed ? (
        <>
          <div className="flex items-center gap-2 px-4 py-3 border-b shrink-0">
            {showBack && (
              <Button variant="ghost" size="icon-sm" onClick={() => navigate("/feeds")} title="Back" className="-ml-1 mr-1">
                <ArrowLeftIcon size={16} />
              </Button>
            )}
            <RssIcon size={14} className="text-primary shrink-0" />
            <span className="font-medium text-sm truncate flex-1">{selectedFeed.title}</span>
            {viaCorsProxy && (
              <Badge variant="outline" className="text-xs text-amber-700 border-amber-300 shrink-0 gap-1">
                <ShieldOffIcon size={10} />
                via {activePreset.label.replace(" (recommended)", "")}
              </Badge>
            )}
            <Button variant="ghost" size="icon-sm" className="shrink-0" onClick={() => loadFeed(selectedFeed)} disabled={loadingFeed}>
              <RefreshCwIcon size={13} className={loadingFeed ? "animate-spin" : ""} />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingFeed && (
              <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
                <LoaderIcon size={20} className="animate-spin" />
                <span className="text-sm">Loading feed…</span>
              </div>
            )}
            {feedError && !loadingFeed && !corsBlocked && (
              <div className="feed-error">
                <TriangleAlertIcon size={32} strokeWidth={0.8} className="text-amber-400" />
                <p className="font-medium text-sm">Could not load feed</p>
                <p className="text-xs text-muted-foreground max-w-xs">{feedError}</p>
                <Button size="sm" variant="outline" onClick={() => loadFeed(selectedFeed)}>Try again</Button>
              </div>
            )}
            {feedError && !loadingFeed && corsBlocked && (
              <div className="feed-cors-error">
                <ShieldOffIcon size={36} strokeWidth={0.8} className="text-amber-500 shrink-0" />
                <div className="text-center">
                  <p className="font-medium text-sm">Blocked by CORS policy</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs">The browser blocked this feed. Use a CORS proxy to load it.</p>
                </div>
                <div className="w-full flex flex-col gap-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Choose proxy</p>
                  <div className="flex flex-col gap-1.5">
                    {PROXY_PRESETS.map((preset) => (
                      <label key={preset.id} className={`feed-proxy-option ${proxyPresetId === preset.id ? "feed-proxy-option--active" : "feed-proxy-option--idle"}`}>
                        <input
                          type="radio"
                          name="proxy-preset-feeds"
                          value={preset.id}
                          checked={proxyPresetId === preset.id}
                          onChange={() => setProxyPreset(preset.id)}
                          className="mt-0.5 accent-foreground"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium leading-tight">{preset.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{preset.hint}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  {proxyPresetId === "custom" && (
                    <InputUI
                      placeholder="https://your-proxy.example.com/?url="
                      value={customProxyPrefix}
                      onChange={(e) => setCustomProxyPrefix(e.target.value)}
                      className="h-8 text-xs mt-1"
                      autoFocus
                    />
                  )}
                  {proxyPresetId === "local" && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted text-xs text-muted-foreground font-mono">
                      $ npm run proxy
                    </div>
                  )}
                </div>
                <div className="flex gap-2 w-full">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={retryWithProxy}
                    disabled={proxyPresetId === "custom" && !customProxyPrefix.trim()}
                  >
                    <ShieldOffIcon size={13} />
                    Retry via {activePreset.label.replace(" (recommended)", "")}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => loadFeed(selectedFeed)}>Direct</Button>
                </div>
              </div>
            )}
            {!loadingFeed && !feedError && items.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground text-center">
                <BookMarkedIcon size={28} strokeWidth={0.7} />
                <p className="text-sm">No items found in this feed.</p>
              </div>
            )}
            {!loadingFeed && items.map((item, i) => (
              <FeedItem key={`${item.link}-${i}`} item={item} onImport={setImportItem} />
            ))}
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <RssIcon size={48} strokeWidth={0.5} />
          <p className="text-sm">Select a feed or add one to get started.</p>
          <Button variant="outline" size="sm" onClick={() => setAddingFeed(true)}>
            <PlusIcon size={14} /> Add Feed
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <SidebarPage title="Feeds">
      <div className="flex flex-col flex-1 min-h-0 md:hidden">
        {!feedId ? (
          <FeedListPanel className="flex-1" />
        ) : (
          <FeedItemsPanel showBack className="flex-1" />
        )}
      </div>

      <div className="hidden md:flex flex-1 overflow-hidden">
        <ResizablePanelGroup orientation="horizontal" className="flex-1">
          <ResizablePanel defaultSize={256} minSize={200} maxSize={400} className="flex flex-col">
            <FeedListPanel className="flex-1" />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={75} minSize={40} className="flex flex-col">
            <FeedItemsPanel className="flex-1" />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <RecipeFormDialog
        open={!!importItem}
        onOpenChange={(open) => !open && setImportItem(null)}
        recipe={importRecipeDefaults}
      />
    </SidebarPage>
  );
}
