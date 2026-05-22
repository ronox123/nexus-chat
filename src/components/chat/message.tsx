"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Check, Copy, RefreshCw } from "lucide-react";
import type { Message as MessageType } from "@/lib/types";
import { LogoMark } from "@/components/brand/logo";
import { Markdown } from "./markdown";
import { cn, formatTime } from "@/lib/utils";

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 rounded-full bg-muted-foreground/70"
          style={{ animation: `blink 1.2s ${i * 0.18}s infinite ease-in-out` }}
        />
      ))}
    </div>
  );
}

export function MessageItem({
  message,
  streaming,
  isLastAssistant,
  onRegenerate,
}: {
  message: MessageType;
  streaming: boolean;
  isLastAssistant: boolean;
  onRegenerate: () => void;
}) {
  const [copied, setCopied] = React.useState(false);
  const isUser = message.role === "user";

  async function copy() {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="flex justify-end"
      >
        <div className="group max-w-[85%] sm:max-w-[78%]">
          <div className="rounded-2xl rounded-tr-md border border-border bg-elevated px-4 py-2.5 text-[15px] leading-relaxed text-foreground">
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          </div>
          <div className="mt-1 flex justify-end pr-1">
            <span className="text-[11px] text-subtle-foreground opacity-0 transition-opacity group-hover:opacity-100">
              {formatTime(message.created_at)}
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  const isEmptyStreaming = streaming && message.content.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="flex gap-3.5"
    >
      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border border-border bg-surface">
        <LogoMark className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        {isEmptyStreaming ? (
          <TypingDots />
        ) : (
          <div className={cn(streaming && isLastAssistant && "typing-stream")}>
            <Markdown content={message.content} />
          </div>
        )}

        {!streaming && message.content.length > 0 && (
          <div className="mt-1.5 flex items-center gap-0.5">
            <ActionButton onClick={copy} label={copied ? "Copied" : "Copy"}>
              {copied ? <Check className="size-3.5 text-emerald" /> : <Copy className="size-3.5" />}
            </ActionButton>
            {isLastAssistant && (
              <ActionButton onClick={onRegenerate} label="Regenerate">
                <RefreshCw className="size-3.5" />
              </ActionButton>
            )}
            <span className="ml-1 text-[11px] text-subtle-foreground">
              {formatTime(message.created_at)}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ActionButton({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      {children}
    </button>
  );
}
