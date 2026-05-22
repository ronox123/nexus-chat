"use client";

import { usePathname, useRouter } from "next/navigation";
import { PanelLeftOpen, Menu, PenSquare } from "lucide-react";
import { useChatStore } from "@/lib/store/chat-store";
import { useUIStore } from "@/lib/store/ui-store";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { LogoMark } from "@/components/brand/logo";
import { ModelSelector } from "@/components/chat/model-selector";

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { collapsed, toggleCollapsed, setMobileOpen, draftModel, setDraftModel } = useUIStore();
  const { chats, patchLocal } = useChatStore();

  const chatId = pathname.startsWith("/chat/") ? pathname.split("/")[2] : null;
  const chat = chatId ? chats.find((c) => c.id === chatId) : null;
  const model = chat?.model ?? draftModel;
  const title = chat?.title ?? "New chat";

  function onModelChange(next: string) {
    if (chat) patchLocal(chat.id, { model: next });
    else setDraftModel(next);
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-3 sm:px-4">
      {/* Mobile menu */}
      <Button
        variant="ghost"
        size="icon-sm"
        className="lg:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu />
      </Button>

      {/* Desktop expand (only when collapsed) */}
      {collapsed && (
        <div className="hidden items-center gap-1 lg:flex">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={toggleCollapsed}
                aria-label="Open sidebar"
              >
                <PanelLeftOpen />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Open sidebar</TooltipContent>
          </Tooltip>
          <LogoMark className="size-6" />
        </div>
      )}

      <div className="ml-0.5">
        <ModelSelector value={model} onChange={onModelChange} />
      </div>

      <p className="mx-auto hidden max-w-[40%] truncate text-sm font-medium text-muted-foreground md:block">
        {title}
      </p>

      <div className="ml-auto flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => router.push("/chat")}
              aria-label="New chat"
            >
              <PenSquare />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">New chat</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
