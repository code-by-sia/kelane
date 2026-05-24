import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import useFeedsStore from "@/store/feeds";

export function AddFeedInline({ onDone }) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const addFeed = useFeedsStore((s) => s.addFeed);
  const navigate = useNavigate();

  const handleAdd = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    const id = crypto.randomUUID();
    addFeed({ id, url: trimmed, title: title.trim() || trimmed });
    onDone();
    navigate(`/feeds/${id}`);
    toast.success("Feed added");
  };

  return (
    <div className="feeds-add-form">
      <Input
        placeholder="Feed URL…"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        className="h-7 text-xs"
        autoFocus
      />
      <Input
        placeholder="Title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="h-7 text-xs"
      />
      <div className="feeds-add-form__actions">
        <Button size="sm" className="flex-1 h-7 text-xs" disabled={!url.trim()} onClick={handleAdd}>
          Add
        </Button>
        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
