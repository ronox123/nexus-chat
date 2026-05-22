"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { PenSquare, Search, Settings, LogOut, X, PanelLeftClose } from "lucide-react";
import { useChatStore } from "@/lib/store/chat-store";
import { useUIStore } from "@/lib/store/ui-store";
import { useAuth } from "@/components/auth/auth-provider";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatRelativeDate } from "@/lib/utils";
import { ChatListItem } from "./chat-list-item";
import type { Chat } from "@/lib/types";

function groupChats(chats: Chat[]) {
  const pinned = chats.filter((c) => c.pinned);
  const rest = chats.filter((c) => !c.pinned);
  const groups = new Map<string, Chat[]>();
  for (const c of rest) {
    const key = formatRelativeDate(c.updated_at);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(c);
  }
  return { pinned, groups };
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const { chats, loading } = useChatStore();
  const { toggleCollapsed, setSettingsOpen } = useUIStore();
  const { user, signOut, isMock } = useAuth();
  const [query, setQuery] = React.useState("");

  const activeId = pathname.startsWith("/chat/") ? pathname.split("/")[2] : null;

  const filtered = React.useMemo(() => {
    if (!query.trim()) return chats;
    const q = query.toLowerCase();
    return chats.filter((c) => c.title.toLowerCase().includes(q));
  }, [chats, query]);

  const { pinned, groups } = React.useMemo(() => groupChats(filtered), [filtered]);

  const initials =
    user?.name
      ?.split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  return (
    <div className="flex h-full w-72 flex-col bg-surface">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3.5">
        <div className="pl-1">
          <Logo />
        </div>
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="hidden lg:inline-flex"
                onClick={toggleCollapsed}
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Collapse</TooltipContent>
          </Tooltip>
          <Button
            variant="ghost"
            size="icon-sm"
            className="lg:hidden"
            onClick={onNavigate}
            aria-label="Close menu"
          >
            <X />
          </Button>
        </div>
      </div>

      {/* New chat */}
      <div className="px-3">
        <Button
          variant="secondary"
          className="w-full justify-start gap-2.5"
          onClick={() => {
            router.push("/chat");
            onNavigate?.();
          }}
        >
          <PenSquare className="size-4" />
          New chat
        </Button>
      </div>

      {/* Search */}
      <div className="px-3 pb-2 pt-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats"
            className="h-9 w-full rounded-lg border border-transparent bg-elevated pl-9 pr-3 text-sm text-foreground placeholder:text-subtle-foreground transition-colors focus:border-emerald/40 focus:outline-none"
          />
        </div>
      </div>

      {/* History */}
      <nav className="flex-1 overflow-y-auto px-3 pb-3">
        {loading ? (
          <div className="space-y-2 px-1 pt-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" style={{ opacity: 1 - i * 0.12 }} />
            ))}
          </div>
        ) : chats.length === 0 ? (
          <p className="px-2 pt-6 text-center text-xs leading-relaxed text-subtle-foreground">
            No conversations yet.
            <br />
            Start a new chat to begin.
          </p>
        ) : filtered.length === 0 ? (
          <p className="px-2 pt-6 text-center text-xs text-subtle-foreground">
            No chats match “{query}”.
          </p>
        ) : (
          <div className="space-y-4 pt-1">
            {pinned.length > 0 && (
              <Section label="Pinned">
                {pinned.map((c) => (
                  <ChatListItem key={c.id} chat={c} active={c.id === activeId} onNavigate={onNavigate} />
                ))}
              </Section>
            )}
            {[...groups.entries()].map(([label, items]) => (
              <Section key={label} label={label}>
                {items.map((c) => (
                  <ChatListItem key={c.id} chat={c} active={c.id === activeId} onNavigate={onNavigate} />
                ))}
              </Section>
            ))}
          </div>
        )}
      </nav>

      {/* Profile */}
      <div className="border-t border-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-accent focus-visible:outline-none">
            <Avatar>
              {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{user?.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-[248px]">
            <DropdownMenuLabel>
              {isMock ? "Preview account" : "Signed in"}
            </DropdownMenuLabel>
            <DropdownMenuItem
              onSelect={() => {
                setSettingsOpen(true);
                onNavigate?.();
              }}
            >
              <Settings /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              destructive
              onSelect={async () => {
                await signOut();
                router.replace("/login");
              }}
            >
              <LogOut /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wider text-subtle-foreground">
        {label}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}
