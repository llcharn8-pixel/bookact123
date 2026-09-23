import { NextResponse } from "next/server";
import { fetchTranscriptText } from "@/lib/ai/youtube";

export async function GET(request: Request) {
  const videoId = new URL(request.url).searchParams.get("v") ?? "jNQXAC9IVRw";
  try {
    const text = await fetchTranscriptText(videoId);
    return NextResponse.json({ ok: true, length: text.length, sample: text.slice(0, 200) });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
