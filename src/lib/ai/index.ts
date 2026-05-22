import type { AIProvider } from "./provider";
import { hasOpenAI } from "./provider";
import { MockProvider } from "./mock";
import { OpenAIProvider } from "./openai";

let cached: AIProvider | null = null;

export function getProvider(): AIProvider {
  if (cached) return cached;
  cached = hasOpenAI ? new OpenAIProvider() : new MockProvider();
  return cached;
}

export { hasOpenAI };
