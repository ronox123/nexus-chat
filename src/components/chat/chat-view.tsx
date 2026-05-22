"use client";

import * as React from "react";
import { useConversation } from "@/hooks/use-conversation";
import { takePendingMessage } from "@/lib/pending";
import { MessageList } from "./message-list";
import { Composer } from "./composer";
import { Skeleton } from "@/components/ui/skeleton";

export function ChatView({ chatId }: { chatId: string }) {
  const { messages, loading, streaming, send, regenerate, stop } = useConversation(chatId);
  const sentPending = React.useRef(false);

  // Pick up the first message handed over from the new-chat screen.
  React.useEffect(() => {
    if (loading || sentPending.current) return;
    const pending = takePendingMessage(chatId);
    if (pending) {
      sentPending.current = true;
      send(pending);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, chatId]);

  if (loading) {
    return (
      <div className="flex h-full flex-col">
        <div className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-8">
          <div className="flex justify-end">
            <Skeleton className="h-10 w-1/2 rounded-2xl" />
          </div>
          <div className="flex gap-3.5">
            <Skeleton className="size-7 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-4 w-[75%]" />
              <Skeleton className="h-4 w-[60%]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <MessageList messages={messages} streaming={streaming} onRegenerate={regenerate} />
      <Composer onSend={send} onStop={stop} streaming={streaming} autoFocus />
    </div>
  );
}
