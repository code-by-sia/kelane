import { useState } from "react";
import { LoaderIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import useSettingsStore, { getProxyPrefix } from "@/store/settings";
import { fetchDirect, fetchViaProxy } from "./utils";

export function AddFeedForm({ onAdd, onCancel }) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const settingsState = useSettingsStore();
  const proxyPrefix = getProxyPrefix(settingsState);

  const handleAdd = async () => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;
    setLoading(true);
    try {
      let result;
      try {
        result = await fetchDirect(trimmedUrl);
      } catch {
        result = await fetchViaProxy(trimmedUrl, proxyPrefix);
      }
      onAdd({
        url: trimmedUrl,
        title: title.trim() || result.channelTitle || trimmedUrl,
      });
    } catch {
      toast.error("Could not reach that feed — check the URL and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feed-add-form">
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
        <Button size="sm" className="flex-1" disabled={!url.trim() || loading} onClick={handleAdd}>
          {loading ? <LoaderIcon size={13} className="animate-spin" /> : <PlusIcon size={13} />}
          Add Feed
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
