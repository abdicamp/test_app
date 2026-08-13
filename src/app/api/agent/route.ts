import { NextResponse } from "next/server";
import { buildAgentPrompt, cursorFetch, repoConfig } from "@/lib/cursor";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      prompt?: string;
      agentId?: string;
    };

    const prompt = body.prompt?.trim();
    if (!prompt) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }

    const repo = repoConfig();
    const modelId = process.env.CURSOR_MODEL_ID || "composer-2.5";

    if (body.agentId) {
      for (let i = 0; i < 30; i++) {
        try {
          const data = await cursorFetch(`/agents/${body.agentId}/runs`, {
            method: "POST",
            body: JSON.stringify({
              prompt: { text: prompt },
            }),
          });
          const run = data.run as { id?: string } | undefined;
          return NextResponse.json({
            agentId: body.agentId,
            runId: run?.id,
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          if (message.includes("409")) {
            await new Promise((r) => setTimeout(r, 2000));
            continue;
          }
          throw err;
        }
      }
      return NextResponse.json({ error: "Agent busy" }, { status: 409 });
    }

    const data = await cursorFetch("/agents", {
      method: "POST",
      body: JSON.stringify({
        prompt: { text: buildAgentPrompt(prompt) },
        name: "Lumen Site Agent",
        mode: "agent",
        model: { id: modelId },
        workOnCurrentBranch: true,
        autoCreatePR: false,
        repos: [
          {
            url: repo.url,
            startingRef: repo.startingRef,
          },
        ],
      }),
    });

    const agent = data.agent as
      | { id?: string; url?: string }
      | undefined;
    const run = data.run as { id?: string } | undefined;

    return NextResponse.json({
      agentId: agent?.id,
      agentUrl: agent?.url,
      runId: run?.id,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
