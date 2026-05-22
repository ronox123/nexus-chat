import { NextResponse } from "next/server";
import { getProvider } from "@/lib/ai";
import type { ChatTurn } from "@/lib/ai/provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ChatRequest {
  model?: string;
  system?: string;
  messages: ChatTurn[];
}

export async function POST(req: Request) {
  let body: ChatRequest;
  try {
    body = (await req.json()) as ChatRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: "messages is required" }, { status: 400 });
  }

  const provider = getProvider();
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of provider.stream({
          model: body.model ?? "gpt-4o-mini",
          messages: body.messages,
          system: body.system,
          signal: req.signal,
        })) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Generation failed";
        controller.enqueue(encoder.encode(`\n\n_[Error: ${message}]_`));
      } finally {
        controller.close();
      }
    },
    cancel() {
      // Client aborted — the provider observes req.signal and stops.
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
