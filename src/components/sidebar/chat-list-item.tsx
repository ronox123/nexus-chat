"use client";

import * as React from "react";
import Link from "next/link";
import { MoreHorizontal, Pencil, Pin, PinOff, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Chat } from "@/lib/types";
import { useChatStore } from "@/lib/store/chat-store";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ChatListItem({
  chat,
  active,
  onNavigate,
}: {
  chat: Chat;
  active: boolean;
  onNavigate?: () => void;
}) {
  const { rename, remove, togglePin } = useChatStore();
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(chat.title);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  function commit() {
    const next = draft.trim();
    setEditing(false);
    if (next && next !== chat.title) rename(chat.id, next);
    else setDraft(chat.title);
  }

  return (
    <div
      className={cn(
        "group relative flex items-center rounded-lg transition-colors",
        active ? "bg-accent" : "hover:bg-accent/60",
      )}
    >
      {chat.pinned && (
        <Pin className="pointer-events-none absolute -left-0.5 top-1/2 size-2.5 -translate-y-1/2 text-emerald/70" />
      )}
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setDraft(chat.title);
              setEditing(false);
            }
          }}
          className="m-1 w-full rounded-md border border-emerald/40 bg-input px-2 py-1.5 text-sm text-foreground outline-none"
        />
      ) : (
        <Link
          href={`/chat/${chat.id}`}
          onClick={onNavigate}
          className={cn(
            "min-w-0 flex-1 truncate py-2 pl-3 pr-8 text-sm transition-colors",
            active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground",
          )}
        >
          {chat.title}
        </Link>
      )}

      {!editing && (
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Chat options"
            className={cn(
              "absolute right-1.5 flex size-6 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-overlay hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100 data-[state=open]:opacity-100 data-[state=open]:bg-overlay",
            )}
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onSelect={() => setEditing(true)}>
              <Pencil /> Rename
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => togglePin(chat.id)}>
              {chat.pinned ? <PinOff /> : <Pin />}
              {chat.pinned ? "Unpin" : "Pin"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              destructive
              onSelect={() => {
                remove(chat.id);
                toast.success("Conversation deleted");
              }}
            >
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
