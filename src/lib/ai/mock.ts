import type { AIProvider, StreamArgs } from "./provider";

const OPENERS = [
  "Great question.",
  "Here's how I'd think about it.",
  "Let me walk you through it.",
  "Happy to help with that.",
];

function buildMockReply(prompt: string): string {
  const opener = OPENERS[Math.floor(Math.random() * OPENERS.length)];
  const topic = prompt.trim().slice(0, 120) || "your request";

  return `${opener}

You asked about **${topic}**. This is a fully working preview running in **mock mode** — no API key is configured yet, so I'm generating a local response to demonstrate the streaming experience.

A few things worth noting:

- The interface streams text token-by-token, just like a real model.
- Markdown renders cleanly, including \`inline code\` and lists.
- Code blocks are syntax-highlighted with a copy button:

\`\`\`ts
async function ask(question: string) {
  const res = await fetch("/api/chat", {
    method: "POST",
    body: JSON.stringify({ messages: [{ role: "user", content: question }] }),
  });
  // stream the response back to the UI
  return res.body;
}
\`\`\`

To switch to real answers, add your \`OPENAI_API_KEY\` to \`.env.local\` and restart the dev server. Everything else stays exactly the same.`;
}

function tokenize(text: string): string[] {
  // Split on spaces but keep them so reassembly is lossless.
  return text.match(/\S+\s*|\s+/g) ?? [text];
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class MockProvider implements AIProvider {
  async *stream({ messages, signal }: StreamArgs) {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const reply = buildMockReply(lastUser?.content ?? "");
    const tokens = tokenize(reply);

    for (const token of tokens) {
      if (signal?.aborted) return;
      await sleep(12 + Math.random() * 26);
      yield token;
    }
  }
}
