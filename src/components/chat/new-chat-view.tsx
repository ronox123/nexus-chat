"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useChatStore } from "@/lib/store/chat-store";
import { useUIStore } from "@/lib/store/ui-store";
import { useAuth } from "@/components/auth/auth-provider";
import { Composer } from "./composer";
import { SUGGESTIONS } from "./suggestions";
import { deriveTitle } from "@/lib/utils";
import { setPendingMessage } from "@/lib/pending";

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function NewChatView() {
  const router = useRouter();
  const { createChat } = useChatStore();
  const draftModel = useUIStore((s) => s.draftModel);
  const { user } = useAuth();
  const [busy, setBusy] = React.useState(false);
  const firstName = user?.name?.split(" ")[0] ?? "there";

  async function start(text: string) {
    if (busy) return;
    setBusy(true);
    const chat = await createChat(draftModel, deriveTitle(text));
    if (!chat) {
      setBusy(false);
      return toast.error("Couldn't save the chat. If using Firebase, publish the Firestore rules.");
    }
    setPendingMessage(chat.id, text);
    router.push(`/chat/${chat.id}`);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="aurora pointer-events-none absolute inset-x-0 top-0 h-72" />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-2xl text-center"
        >
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {greeting()}, {firstName}.
          </h1>
          <p className="mx-auto mt-3 max-w-md text-[15px] text-muted-foreground">
            What would you like to explore today? Ask anything, or start with a suggestion.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {SUGGESTIONS.map((s, i) => (
              <motion.button
                key={s.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => start(s.prompt)}
                disabled={busy}
                className="group flex items-start gap-3 rounded-xl border border-border bg-surface/60 p-3.5 text-left transition-all hover:border-border-strong hover:bg-surface disabled:opacity-60"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-elevated text-muted-foreground transition-colors group-hover:text-emerald">
                  <s.icon className="size-4" />
                </span>
                <span>
                  <span className="block text-sm font-medium text-foreground">{s.title}</span>
                  <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-muted-foreground">
                    {s.prompt}
                  </span>
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      <Composer onSend={start} onStop={() => {}} streaming={busy} autoFocus />
    </div>
  );
}
