"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import {
  Check,
  Download,
  LogOut,
  Monitor,
  Moon,
  Settings2,
  Sparkles,
  Sun,
  Trash2,
  User2,
  Database,
} from "lucide-react";
import { toast } from "sonner";
import { useUIStore } from "@/lib/store/ui-store";
import { useSettingsStore } from "@/lib/store/settings-store";
import { useChatStore } from "@/lib/store/chat-store";
import { useAuth } from "@/components/auth/auth-provider";
import { AI_MODELS } from "@/lib/types";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type Tab = "general" | "models" | "account" | "data";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "general", label: "General", icon: Settings2 },
  { id: "models", label: "Models", icon: Sparkles },
  { id: "account", label: "Account", icon: User2 },
  { id: "data", label: "Data", icon: Database },
];

export function SettingsDialog() {
  const { settingsOpen, setSettingsOpen, setDraftModel } = useUIStore();
  const { settings, update } = useSettingsStore();
  const [tab, setTab] = React.useState<Tab>("general");

  return (
    <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
      <DialogContent className="max-w-2xl overflow-hidden p-0">
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <DialogDescription className="sr-only">
          Manage appearance, models, your account, and data.
        </DialogDescription>
        <div className="flex max-h-[80vh] flex-col sm:h-[520px] sm:flex-row">
          {/* Tabs */}
          <nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-border p-3 sm:w-48 sm:flex-col sm:overflow-visible sm:border-b-0 sm:border-r">
            <p className="hidden px-2.5 pb-2 pt-1 text-xs font-medium text-subtle-foreground sm:block">
              Settings
            </p>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                  tab === t.id
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                )}
              >
                <t.icon className="size-4" />
                {t.label}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6">
            {tab === "general" && <GeneralTab settings={settings} update={update} />}
            {tab === "models" && (
              <ModelsTab
                value={settings.default_model}
                onChange={(m) => {
                  update({ default_model: m });
                  setDraftModel(m);
                }}
              />
            )}
            {tab === "account" && <AccountTab onClose={() => setSettingsOpen(false)} />}
            {tab === "data" && <DataTab onClose={() => setSettingsOpen(false)} />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-1 text-base font-semibold tracking-tight text-foreground">{children}</h3>;
}

function GeneralTab({
  settings,
  update,
}: {
  settings: ReturnType<typeof useSettingsStore.getState>["settings"];
  update: (p: Partial<typeof settings>) => void;
}) {
  const { theme, setTheme } = useTheme();
  const current = theme ?? "dark";
  const themes = [
    { id: "dark", label: "Dark", icon: Moon },
    { id: "light", label: "Light", icon: Sun },
    { id: "system", label: "System", icon: Monitor },
  ];

  return (
    <div className="animate-[fade-in_0.2s_ease]">
      <SectionTitle>Appearance</SectionTitle>
      <div className="divide-y divide-border">
        <Row title="Theme" description="Choose how Nexus looks to you.">
          <div className="flex gap-1.5">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id);
                  update({ theme: t.id });
                }}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
                  current === t.id
                    ? "border-emerald/40 bg-emerald/10 text-foreground"
                    : "border-border text-muted-foreground hover:bg-accent",
                )}
              >
                <t.icon className="size-3.5" />
                {t.label}
              </button>
            ))}
          </div>
        </Row>
        <Row
          title="Send with Enter"
          description="Off uses ⌘/Ctrl + Enter to send instead."
        >
          <Switch
            checked={settings.send_on_enter}
            onCheckedChange={(v) => update({ send_on_enter: v })}
          />
        </Row>
      </div>

      <div className="mt-6">
        <SectionTitle>Personalization</SectionTitle>
        <p className="mb-3 text-xs text-muted-foreground">
          A system instruction applied to every new message in your conversations.
        </p>
        <Textarea
          placeholder="e.g. You are a concise, thoughtful assistant. Prefer examples over theory."
          value={settings.system_prompt ?? ""}
          onChange={(e) => update({ system_prompt: e.target.value })}
          className="min-h-[96px]"
        />
      </div>
    </div>
  );
}

function ModelsTab({ value, onChange }: { value: string; onChange: (m: string) => void }) {
  return (
    <div className="animate-[fade-in_0.2s_ease]">
      <SectionTitle>Default model</SectionTitle>
      <p className="mb-4 text-xs text-muted-foreground">
        New conversations start with this model. You can switch per-chat anytime.
      </p>
      <div className="space-y-2">
        {AI_MODELS.map((m) => {
          const selected = m.id === value;
          return (
            <button
              key={m.id}
              onClick={() => onChange(m.id)}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-colors",
                selected
                  ? "border-emerald/40 bg-emerald/[0.06]"
                  : "border-border hover:bg-accent",
              )}
            >
              <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center">
                {selected && <Check className="size-4 text-emerald" />}
              </span>
              <span className="flex-1">
                <span className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{m.label}</span>
                  {m.badge && (
                    <span className="rounded-full border border-border bg-elevated px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      {m.badge}
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{m.description}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AccountTab({ onClose }: { onClose: () => void }) {
  const { user, signOut, isMock } = useAuth();
  const router = useRouter();
  const initials =
    user?.name
      ?.split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  return (
    <div className="animate-[fade-in_0.2s_ease]">
      <SectionTitle>Account</SectionTitle>
      <div className="mt-4 flex items-center gap-3.5 rounded-xl border border-border bg-surface/60 p-4">
        <Avatar className="size-12">
          {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
          <AvatarFallback className="text-base">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{user?.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      {isMock && (
        <p className="mt-3 rounded-lg border border-border bg-elevated/50 px-3 py-2.5 text-xs text-muted-foreground">
          You&apos;re in preview mode. Connect Firebase to enable real accounts, sync, and
          persistence across devices.
        </p>
      )}

      <div className="mt-6">
        <Button
          variant="danger"
          onClick={async () => {
            await signOut();
            onClose();
            router.replace("/login");
          }}
        >
          <LogOut /> Sign out
        </Button>
      </div>
    </div>
  );
}

function DataTab({ onClose }: { onClose: () => void }) {
  const { db } = useAuth();
  const router = useRouter();
  const { chats, clearAll } = useChatStore();
  const [confirming, setConfirming] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);

  async function exportChats() {
    if (!db) return;
    setExporting(true);
    try {
      const full = await Promise.all(
        chats.map(async (c) => ({
          title: c.title,
          model: c.model,
          created_at: c.created_at,
          messages: (await db.listMessages(c.id)).map((m) => ({
            role: m.role,
            content: m.content,
            created_at: m.created_at,
          })),
        })),
      );
      const blob = new Blob([JSON.stringify({ exported_at: new Date().toISOString(), chats: full }, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nexus-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Conversations exported");
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="animate-[fade-in_0.2s_ease]">
      <SectionTitle>Your data</SectionTitle>
      <p className="mb-4 text-xs text-muted-foreground">
        {chats.length} conversation{chats.length === 1 ? "" : "s"} stored.
      </p>

      <div className="divide-y divide-border">
        <Row title="Export conversations" description="Download everything as a JSON file.">
          <Button variant="secondary" size="sm" onClick={exportChats} disabled={exporting || chats.length === 0}>
            <Download /> Export
          </Button>
        </Row>
        <Row
          title="Delete all conversations"
          description="This permanently removes every chat. Cannot be undone."
        >
          {confirming ? (
            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={async () => {
                  await clearAll();
                  setConfirming(false);
                  onClose();
                  router.push("/chat");
                  toast.success("All conversations deleted");
                }}
              >
                Confirm
              </Button>
            </div>
          ) : (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setConfirming(true)}
              disabled={chats.length === 0}
            >
              <Trash2 /> Delete all
            </Button>
          )}
        </Row>
      </div>
    </div>
  );
}
