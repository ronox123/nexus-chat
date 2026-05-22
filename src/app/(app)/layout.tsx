"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { useChatStore } from "@/lib/store/chat-store";
import { useSettingsStore } from "@/lib/store/settings-store";
import { AppShell } from "@/components/shell/app-shell";
import { LogoMark } from "@/components/brand/logo";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, db } = useAuth();
  const router = useRouter();
  const setChatBackend = useChatStore((s) => s.setBackend);
  const setSettingsBackend = useSettingsStore((s) => s.setBackend);

  React.useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  React.useEffect(() => {
    setChatBackend(db);
    setSettingsBackend(db);
  }, [db, setChatBackend, setSettingsBackend]);

  if (loading || !user) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <LogoMark className="size-9 animate-pulse" />
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
