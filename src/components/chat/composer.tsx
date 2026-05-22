"use client";

import * as React from "react";
import { ArrowUp, Paperclip, Square } from "lucide-react";
import { toast } from "sonner";
import { useSettingsStore } from "@/lib/store/settings-store";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const MAX_HEIGHT = 200;

export function Composer({
  onSend,
  onStop,
  streaming,
  autoFocus,
}: {
  onSend: (text: string) => void;
  onStop: () => void;
  streaming: boolean;
  autoFocus?: boolean;
}) {
  const [value, setValue] = React.useState("");
  const ref = React.useRef<HTMLTextAreaElement>(null);
  const sendOnEnter = useSettingsStore((s) => s.settings.send_on_enter);

  const resize = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
  }, []);

  React.useEffect(() => {
    resize();
  }, [value, resize]);

  React.useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  function submit() {
    const text = value.trim();
    if (!text || streaming) return;
    onSend(text);
    setValue("");
    requestAnimationFrame(() => ref.current?.focus());
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const enterToSend = sendOnEnter ? !e.shiftKey : e.metaKey || e.ctrlKey;
    if (e.key === "Enter" && enterToSend) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-3 pb-4 pt-2 sm:px-4">
      <div
        className={cn(
          "relative flex items-end gap-2 rounded-2xl border border-border bg-surface px-2.5 py-2 shadow-lg transition-colors",
          "focus-within:border-border-strong focus-within:shadow-xl",
        )}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => toast("File uploads are coming soon.", { icon: "📎" })}
              className="mb-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Attach file"
            >
              <Paperclip className="size-[18px]" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">Attach (soon)</TooltipContent>
        </Tooltip>

        <textarea
          ref={ref}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Message Nexus…"
          className="max-h-[200px] flex-1 resize-none bg-transparent py-2 text-[15px] leading-relaxed text-foreground placeholder:text-subtle-foreground focus:outline-none"
        />

        {streaming ? (
          <button
            type="button"
            onClick={onStop}
            className="mb-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-foreground text-background transition-transform hover:scale-105 active:scale-95"
            aria-label="Stop generating"
          >
            <Square className="size-3.5 fill-current" />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={!value.trim()}
            className={cn(
              "mb-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl transition-all",
              value.trim()
                ? "bg-foreground text-background hover:scale-105 active:scale-95"
                : "bg-elevated text-subtle-foreground",
            )}
            aria-label="Send message"
          >
            <ArrowUp className="size-[18px]" />
          </button>
        )}
      </div>
      <p className="mt-2 text-center text-[11px] text-subtle-foreground">
        Nexus can make mistakes. Verify important information.
      </p>
    </div>
  );
}
