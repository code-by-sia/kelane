"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ChatPanel({ messages, streaming, status, progress, onSend, onClose, onClear }) {
  const [input, setInput] = useState("");
  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const isLoading  = status === "loading" || status === "thinking";

  // Auto-scroll when content changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  // Focus the input when the panel mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    onSend(text);
  };

  return (
    <div className="chef-panel">
      {/* ── Header ── */}
      <div className="chef-panel__header">
        <span className="text-2xl leading-none" aria-hidden>🧔</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-tight">Hejar</p>
          <p className="text-[10px] text-muted-foreground leading-tight">Kurdish culinary assistant</p>
        </div>
        <div className="flex items-center gap-0.5">
          {messages.length > 0 && (
            <Button
              variant="ghost" size="icon"
              className="h-7 w-7 text-muted-foreground"
              onClick={onClear}
              title="Clear chat"
            >
              <Trash2 size={13} />
            </Button>
          )}
          <Button
            variant="ghost" size="icon"
            className="h-7 w-7 text-muted-foreground"
            onClick={onClose}
            title="Close"
          >
            <X size={14} />
          </Button>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="chef-messages">
        {/* Static greeting — always visible */}
        <ChatMessage
          role="chef"
          content="Silav! 👋 I'm Hejar. Ask me anything — what to cook tonight, recipe tips, substitutions, or anything about your kitchen!"
        />

        {messages.map((msg, i) => (
          <ChatMessage key={i} role={msg.role === "user" ? "user" : "chef"} content={msg.content} />
        ))}

        {/* Streaming response */}
        {streaming && <ChatMessage role="chef" content={streaming} isStreaming />}

        {/* Thinking indicator */}
        {status === "thinking" && !streaming && <ThinkingBubble />}

        <div ref={bottomRef} />
      </div>

      {/* ── Model loading progress ── */}
      {status === "loading" && (
        <div className="chef-status-bar">
          <div className="chef-status-bar__track">
            <div className="chef-status-bar__fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="chef-status-bar__label">Loading model… {progress}%</p>
        </div>
      )}

      {/* ── WebGPU unsupported ── */}
      {status === "unsupported" && (
        <div className="chef-status-bar">
          <p className="chef-status-bar__label text-amber-600">
            ⚠️ WebGPU not supported. Try Chrome 113+ or Edge 113+.
          </p>
        </div>
      )}

      {/* ── Input ── */}
      <form className="chef-input-row" onSubmit={handleSubmit}>
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Hejar…"
          disabled={isLoading || status === "unsupported"}
          className="h-8 text-sm"
        />
        <Button
          type="submit"
          size="icon"
          className="h-8 w-8 shrink-0"
          disabled={!input.trim() || isLoading || status === "unsupported"}
        >
          <Send size={13} />
        </Button>
      </form>
    </div>
  );
}

function ChatMessage({ role, content, isStreaming }) {
  const isChef = role === "chef";
  return (
    <div className={`chef-msg ${isChef ? "chef-msg--chef" : "chef-msg--user"}`}>
      {isChef && <span className="chef-msg__emoji" aria-hidden>🧑‍🍳</span>}
      <div className="chef-msg__bubble">
        {content}
        {isStreaming && <span className="chef-cursor" aria-hidden />}
      </div>
    </div>
  );
}

function ThinkingBubble() {
  return (
    <div className="chef-msg chef-msg--chef">
      <span className="chef-msg__emoji" aria-hidden>🧑‍🍳</span>
      <div className="chef-msg__bubble chef-thinking-bubble">
        <span /><span /><span />
      </div>
    </div>
  );
}
