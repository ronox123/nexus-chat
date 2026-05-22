"use client";

import { create } from "zustand";

interface UIStore {
  collapsed: boolean;
  mobileOpen: boolean;
  settingsOpen: boolean;
  draftModel: string;
  toggleCollapsed: () => void;
  setMobileOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setDraftModel: (model: string) => void;
}

const COLLAPSE_KEY = "nexus:sidebar-collapsed";

export const useUIStore = create<UIStore>((set) => ({
  collapsed: typeof window !== "undefined" && localStorage.getItem(COLLAPSE_KEY) === "1",
  mobileOpen: false,
  settingsOpen: false,
  draftModel: "gpt-4o-mini",
  toggleCollapsed: () =>
    set((s) => {
      const collapsed = !s.collapsed;
      if (typeof window !== "undefined") {
        localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
      }
      return { collapsed };
    }),
  setMobileOpen: (mobileOpen) => set({ mobileOpen }),
  setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
  setDraftModel: (draftModel) => set({ draftModel }),
}));
