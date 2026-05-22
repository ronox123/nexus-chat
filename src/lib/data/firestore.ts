import {
  type Firestore,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import type { Chat, Message, UserSettings } from "@/lib/types";
import { uid } from "@/lib/utils";
import type { DataBackend, NewChatInput, NewMessageInput } from "./backend";

/**
 * Firestore-backed store.
 *
 * Layout (messages live under their chat so ownership is checked via the
 * parent — this avoids owner-scoped query rejections and composite indexes):
 *   chats/{chatId}                    -> Chat
 *   chats/{chatId}/messages/{msgId}   -> Message
 *   user_settings/{uid}               -> UserSettings
 *
 * Results are sorted client-side, so no composite indexes are required.
 */
export class FirestoreBackend implements DataBackend {
  constructor(
    private fs: Firestore,
    private userId: string,
  ) {}

  private msgCol(chatId: string) {
    return collection(this.fs, "chats", chatId, "messages");
  }

  async listChats(): Promise<Chat[]> {
    const snap = await getDocs(
      query(collection(this.fs, "chats"), where("user_id", "==", this.userId)),
    );
    const chats = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Chat);
    return chats.sort((a, b) => {
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
    await setDoc(doc(this.fs, "chats", chat.id), chat);
    return chat;
  }

  async updateChat(id: string, patch: Partial<Chat>): Promise<void> {
    await updateDoc(doc(this.fs, "chats", id), {
      ...patch,
      updated_at: new Date().toISOString(),
    });
  }

  async deleteChat(id: string): Promise<void> {
    await this.deleteMessagesForChat(id);
    await deleteDoc(doc(this.fs, "chats", id));
  }

  async clearChats(): Promise<void> {
    const snap = await getDocs(
      query(collection(this.fs, "chats"), where("user_id", "==", this.userId)),
    );
    for (const d of snap.docs) {
      await this.deleteMessagesForChat(d.id);
      await deleteDoc(d.ref);
    }
  }

  private async deleteMessagesForChat(chatId: string): Promise<void> {
    const snap = await getDocs(this.msgCol(chatId));
    if (snap.empty) return;
    const batch = writeBatch(this.fs);
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }

  async listMessages(chatId: string): Promise<Message[]> {
    const snap = await getDocs(this.msgCol(chatId));
    const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Message);
    return msgs.sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
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
    await setDoc(doc(this.msgCol(input.chat_id), msg.id), msg);
    return msg;
  }

  async updateMessage(chatId: string, id: string, content: string): Promise<void> {
    await updateDoc(doc(this.msgCol(chatId), id), { content });
  }

  async getSettings(): Promise<UserSettings> {
    const ref = doc(this.fs, "user_settings", this.userId);
    const snap = await getDoc(ref);
    if (snap.exists()) return snap.data() as UserSettings;
    return {
      user_id: this.userId,
      theme: "dark",
      default_model: "gpt-4o-mini",
      system_prompt: null,
      send_on_enter: true,
    };
  }

  async saveSettings(patch: Partial<UserSettings>): Promise<void> {
    const ref = doc(this.fs, "user_settings", this.userId);
    await setDoc(ref, { user_id: this.userId, ...patch }, { merge: true });
  }
}
