import OpenAI from "openai";
import type { AIProvider, StreamArgs } from "./provider";

export class OpenAIProvider implements AIProvider {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async *stream({ model, messages, system, signal }: StreamArgs) {
    const payload = [
      ...(system ? [{ role: "system" as const, content: system }] : []),
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const completion = await this.client.chat.completions.create(
      {
        model: model || process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: payload,
        stream: true,
      },
      { signal },
    );

    for await (const chunk of completion) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) yield delta;
    }
  }
}
