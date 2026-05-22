import type { Chat, Message, UserSettings } from "@/lib/types";

export interface NewChatInput {
  title?: string;
  model: string;
}

export interface NewMessageInput {
  id?: string;
  chat_id: string;
  role: Message["role"];
  content: string;
  model?: string | null;
}

export interface DataBackend {
  listChats(): Promise<Chat[]>;
  createChat(input: NewChatInput): Promise<Chat>;
  updateChat(id: string, patch: Partial<Pick<Chat, "title" | "model" | "pinned">>): Promise<void>;
  deleteChat(id: string): Promise<void>;
  clearChats(): Promise<void>;

  listMessages(chatId: string): Promise<Message[]>;
  addMessage(input: NewMessageInput): Promise<Message>;
  updateMessage(chatId: string, id: string, content: string): Promise<void>;

  getSettings(): Promise<UserSettings>;
  saveSettings(patch: Partial<UserSettings>): Promise<void>;
}
