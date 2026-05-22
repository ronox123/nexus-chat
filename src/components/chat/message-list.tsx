"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import type { Message } from "@/lib/types";
import { MessageItem } from "./message";

export function MessageList({
  messages,
  streaming,
  onRegenerate,
}: {
  messages: Message[];
  streaming: boolean;
  onRegenerate: () => void;
}) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [atBottom, setAtBottom] = React.useState(true);

  const lastAssistantId = React.useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") return messages[i].id;
    }
    return null;
  }, [messages]);

  const checkBottom = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    setAtBottom(distance < 120);
  }, []);

  const scrollToBottom = React.useCallback((behavior: ScrollBehavior = "smooth") => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  // Keep pinned to bottom as content streams in, but only if the user is there.
  React.useEffect(() => {
    if (atBottom) scrollToBottom(streaming ? "auto" : "smooth");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, atBottom]);

  // Jump to bottom on first mount.
  React.useEffect(() => {
    scrollToBottom("auto");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative min-h-0 flex-1">
      <div ref={scrollRef} onScroll={checkBottom} className="h-full overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
          {messages.map((m) => (
            <MessageItem
              key={m.id}
              message={m}
              streaming={streaming && m.id === lastAssistantId}
              isLastAssistant={m.id === lastAssistantId}
              onRegenerate={onRegenerate}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {!atBottom && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            onClick={() => scrollToBottom("smooth")}
            className="absolute bottom-4 left-1/2 flex size-9 -translate-x-1/2 items-center justify-center rounded-full border border-border bg-overlay text-foreground shadow-xl transition-colors hover:bg-elevated"
            aria-label="Scroll to bottom"
          >
            <ArrowDown className="size-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
