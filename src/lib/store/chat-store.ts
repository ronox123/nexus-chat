"use client";

import { create } from "zustand";
import type { Chat } from "@/lib/types";
import type { DataBackend } from "@/lib/data/backend";

interface ChatStore {
  backend: DataBackend | null;
  chats: Chat[];
  loading: boolean;

  setBackend: (backend: DataBackend | null) => Promise<void>;
  reload: () => Promise<void>;
  createChat: (model: string, title?: string) => Promise<Chat | null>;
  rename: (id: string, title: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  /** Locally reflect an update (e.g. after first message) and persist it. */
  patchLocal: (id: string, patch: Partial<Chat>, persist?: boolean) => Promise<void>;
  touch: (id: string) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  backend: null,
  chats: [],
  loading: true,

  async setBackend(backend) {
    set({ backend });
    if (backend) {
      await get().reload();
    } else {
      set({ chats: [], loading: false });
    }
  },

  async reload() {
    const { backend } = get();
    if (!backend) return;
    set({ loading: true });
    try {
      const chats = await backend.listChats();
      set({ chats, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  async createChat(model, title) {
    const { backend } = get();
    if (!backend) return null;
    try {
      const chat = await backend.createChat({ model, title });
      set((s) => ({ chats: [chat, ...s.chats] }));
      return chat;
    } catch {
      return null;
    }
  },

  async rename(id, title) {
    const { backend } = get();
    set((s) => ({ chats: s.chats.map((c) => (c.id === id ? { ...c, title } : c)) }));
    await backend?.updateChat(id, { title }).catch(() => {});
  },

  async remove(id) {
    const { backend } = get();
    set((s) => ({ chats: s.chats.filter((c) => c.id !== id) }));
    await backend?.deleteChat(id).catch(() => {});
  },

  async togglePin(id) {
    const { backend, chats } = get();
    const target = chats.find((c) => c.id === id);
    if (!target) return;
    const pinned = !target.pinned;
    set((s) => ({
      chats: [...s.chats.map((c) => (c.id === id ? { ...c, pinned } : c))].sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }),
    }));
    await backend?.updateChat(id, { pinned }).catch(() => {});
  },

  async clearAll() {
    const { backend } = get();
    set({ chats: [] });
    await backend?.clearChats().catch(() => {});
  },

  async patchLocal(id, patch, persist = true) {
    set((s) => ({ chats: s.chats.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
    if (persist) {
      const { backend } = get();
      await backend?.updateChat(id, patch).catch(() => {});
    }
  },

  touch(id) {
    const now = new Date().toISOString();
    set((s) => ({
      chats: [...s.chats]
        .map((c) => (c.id === id ? { ...c, updated_at: now } : c))
        .sort((a, b) => {
          if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        }),
    }));
  },
}));
