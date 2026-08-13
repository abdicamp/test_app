import { NextResponse } from "next/server";
import { cursorFetch } from "@/lib/cursor";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get("agentId");
    const runId = searchParams.get("runId");

    if (!agentId || !runId) {
      return NextResponse.json(
        { error: "agentId and runId are required" },
        { status: 400 },
      );
    }

    const data = await cursorFetch(`/agents/${agentId}/runs/${runId}`);
    return NextResponse.json({
      id: data.id,
      status: data.status,
      result: data.result ?? null,
      git: data.git ?? null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
