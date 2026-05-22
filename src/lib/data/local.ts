import type { Chat, Message, UserSettings } from "@/lib/types";
import { uid } from "@/lib/utils";
import type { DataBackend, NewChatInput, NewMessageInput } from "./backend";

/**
 * localStorage-backed data store used in mock mode (no Firebase configured).
 * Everything is namespaced per user so multiple demo accounts stay separate.
 */
export class LocalBackend implements DataBackend {
  private readonly chatsKey: string;
  private readonly settingsKey: string;
  private msgKey(chatId: string) {
    return `nexus:${this.userId}:messages:${chatId}`;
  }

  constructor(private userId: string) {
    this.chatsKey = `nexus:${userId}:chats`;
    this.settingsKey = `nexus:${userId}:settings`;
  }

  private read<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  private write<T>(key: string, value: T) {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify(value));
  }

  async listChats(): Promise<Chat[]> {
    const chats = this.read<Chat[]>(this.chatsKey, []);
    return [...chats].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  }

  async createChat(input: NewChatInput): Promise<Chat> {
    const now = new Date().toISOString();
    const chat: Chat = {
      id: uid(),
      user_id: this.userId,
      title: input.title ?? "New chat",
      model: input.model,
      pinned: false,
      created_at: now,
      updated_at: now,
    };
    const chats = this.read<Chat[]>(this.chatsKey, []);
    this.write(this.chatsKey, [chat, ...chats]);
    return chat;
  }

  async updateChat(id: string, patch: Partial<Chat>): Promise<void> {
    const chats = this.read<Chat[]>(this.chatsKey, []);
    this.write(
      this.chatsKey,
      chats.map((c) =>
        c.id === id ? { ...c, ...patch, updated_at: new Date().toISOString() } : c,
      ),
    );
  }

  async deleteChat(id: string): Promise<void> {
    const chats = this.read<Chat[]>(this.chatsKey, []);
    this.write(this.chatsKey, chats.filter((c) => c.id !== id));
    if (typeof window !== "undefined") localStorage.removeItem(this.msgKey(id));
  }

  async clearChats(): Promise<void> {
    const chats = this.read<Chat[]>(this.chatsKey, []);
    for (const c of chats) {
      if (typeof window !== "undefined") localStorage.removeItem(this.msgKey(c.id));
    }
    this.write(this.chatsKey, []);
  }

  async listMessages(chatId: string): Promise<Message[]> {
    return this.read<Message[]>(this.msgKey(chatId), []);
  }

  async addMessage(input: NewMessageInput): Promise<Message> {
    const msg: Message = {
      id: input.id ?? uid(),
      chat_id: input.chat_id,
      role: input.role,
      content: input.content,
      model: input.model ?? null,
      created_at: new Date().toISOString(),
    };
    const list = this.read<Message[]>(this.msgKey(input.chat_id), []);
    this.write(this.msgKey(input.chat_id), [...list, msg]);
    return msg;
  }

  async updateMessage(chatId: string, id: string, content: string): Promise<void> {
    const list = this.read<Message[]>(this.msgKey(chatId), []);
    this.write(
      this.msgKey(chatId),
      list.map((m) => (m.id === id ? { ...m, content } : m)),
    );
  }

  async getSettings(): Promise<UserSettings> {
    return this.read<UserSettings>(this.settingsKey, {
      user_id: this.userId,
      theme: "dark",
      default_model: "gpt-4o-mini",
      system_prompt: null,
      send_on_enter: true,
    });
  }

  async saveSettings(patch: Partial<UserSettings>): Promise<void> {
    const current = await this.getSettings();
    this.write(this.settingsKey, { ...current, ...patch });
  }
}
