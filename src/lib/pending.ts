// Hands the first user message from the "new chat" screen to the freshly
// created conversation route, so navigation doesn't drop it.
const pending = new Map<string, string>();

export function setPendingMessage(chatId: string, text: string) {
  pending.set(chatId, text);
}

export function takePendingMessage(chatId: string): string | null {
  const text = pending.get(chatId);
  if (text !== undefined) {
    pending.delete(chatId);
    return text;
  }
  return null;
}
