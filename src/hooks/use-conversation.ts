"use client";

import * as React from "react";
import { toast } from "sonner";
import type { Message } from "@/lib/types";
import { useAuth } from "@/components/auth/auth-provider";
import { useChatStore } from "@/lib/store/chat-store";
import { useSettingsStore } from "@/lib/store/settings-store";
import { uid, deriveTitle } from "@/lib/utils";

interface SendOptions {
  /** Skip persisting/echoing a new user message — used by regenerate. */
  silent?: boolean;
}

export function useConversation(chatId: string) {
  const { db } = useAuth();
  const { chats, touch, rename } = useChatStore();
  const systemPrompt = useSettingsStore((s) => s.settings.system_prompt);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [streaming, setStreaming] = React.useState(false);
  const abortRef = React.useRef<AbortController | null>(null);

  const chat = chats.find((c) => c.id === chatId);
  const model = chat?.model ?? "gpt-4o-mini";

  // Load history when the chat changes.
  React.useEffect(() => {
    let active = true;
    setLoading(true);
    db?.listMessages(chatId)
      .then((msgs) => {
        if (active) {
          setMessages(msgs);
          setLoading(false);
        }
      })
      .catch(() => active && setLoading(false));
    return () => {
      active = false;
      abortRef.current?.abort();
    };
  }, [chatId, db]);

  const runStream = React.useCallback(
    async (history: Message[], assistantId: string) => {
      const controller = new AbortController();
      abortRef.current = controller;
      setStreaming(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model,
            system: systemPrompt || undefined,
            messages: history.map((m) => ({ role: m.role, content: m.content })),
          }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) throw new Error("The model could not be reached.");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: acc } : m)),
          );
        }

        await db?.updateMessage(chatId, assistantId, acc).catch(() => {});
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          toast.error((err as Error).message || "Generation failed");
        }
        // Persist whatever streamed so far.
        setMessages((prev) => {
          const partial = prev.find((m) => m.id === assistantId);
          if (partial) db?.updateMessage(chatId, assistantId, partial.content).catch(() => {});
          return prev;
        });
      } finally {
        setStreaming(false);
        abortRef.current = null;
        touch(chatId);
      }
    },
    [chatId, db, model, touch, systemPrompt],
  );

  const send = React.useCallback(
    async (text: string, opts: SendOptions = {}) => {
      const trimmed = text.trim();
      if (!trimmed || streaming) return;

      let history = messages;

      if (!opts.silent) {
        const userMsg: Message = {
          id: uid(),
          chat_id: chatId,
          role: "user",
          content: trimmed,
          created_at: new Date().toISOString(),
        };
        history = [...messages, userMsg];
        setMessages(history);
        db?.addMessage({ id: userMsg.id, chat_id: chatId, role: "user", content: trimmed }).catch(
          () => {},
        );

        // Name the conversation from its first message.
        if (messages.length === 0 && (!chat || chat.title === "New chat")) {
          rename(chatId, deriveTitle(trimmed));
        }
      }

      const assistantId = uid();
      const assistantMsg: Message = {
        id: assistantId,
        chat_id: chatId,
        role: "assistant",
        content: "",
        model,
        created_at: new Date().toISOString(),
      };
      setMessages([...history, assistantMsg]);
      db?.addMessage({ id: assistantId, chat_id: chatId, role: "assistant", content: "", model }).catch(
        () => {},
      );

      await runStream(history, assistantId);
    },
    [messages, streaming, chatId, db, chat, model, rename, runStream],
  );

  const regenerate = React.useCallback(async () => {
    if (streaming) return;
    // Drop trailing assistant message, re-stream from the prior context.
    const lastAssistantIndex = [...messages].reverse().findIndex((m) => m.role === "assistant");
    if (lastAssistantIndex === -1) return;
    const idx = messages.length - 1 - lastAssistantIndex;
    const history = messages.slice(0, idx);
    const target = messages[idx];

    setMessages((prev) => prev.map((m) => (m.id === target.id ? { ...m, content: "" } : m)));
    await runStream(history, target.id);
  }, [messages, streaming, runStream]);

  const stop = React.useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { messages, loading, streaming, send, regenerate, stop };
}
