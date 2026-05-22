import type { Role } from "@/lib/types";

export interface ChatTurn {
  role: Role;
  content: string;
}

export interface StreamArgs {
  model: string;
  messages: ChatTurn[];
  system?: string;
  signal?: AbortSignal;
}

/**
 * A provider yields response text in chunks. Implementations must be async
 * generators so the API route can pipe them straight into a ReadableStream.
 */
export interface AIProvider {
  stream(args: StreamArgs): AsyncGenerator<string, void, unknown>;
}

export const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
