"use client";

import { create } from "zustand";
import type { UserSettings } from "@/lib/types";
import type { DataBackend } from "@/lib/data/backend";

const DEFAULTS: UserSettings = {
  user_id: "",
  theme: "dark",
  default_model: "gpt-4o-mini",
  system_prompt: null,
  send_on_enter: true,
};

interface SettingsStore {
  backend: DataBackend | null;
  settings: UserSettings;
  loaded: boolean;
  setBackend: (backend: DataBackend | null) => Promise<void>;
  update: (patch: Partial<UserSettings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  backend: null,
  settings: DEFAULTS,
  loaded: false,

  async setBackend(backend) {
    set({ backend });
    if (!backend) {
      set({ settings: DEFAULTS, loaded: false });
      return;
    }
    try {
      const settings = await backend.getSettings();
      set({ settings, loaded: true });
    } catch {
      set({ loaded: true });
    }
  },

  async update(patch) {
    set((s) => ({ settings: { ...s.settings, ...patch } }));
    await get().backend?.saveSettings(patch);
  },
}));
