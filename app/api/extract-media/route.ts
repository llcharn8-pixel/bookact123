import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/data/entries";
import { AssistantError } from "@/lib/ai/assistant";
import { transcribeMedia } from "@/lib/ai/media";
import { GEMINI_AI_LIMIT_MESSAGE, checkGeminiAiQuota } from "@/lib/ai/usageGuard";

export const maxDuration = 60;

// Vercel serverless functions hard-cap request bodies at 4.5MB — this stays
// safely under that, so only short clips (roughly a couple of minutes of
// audio, or a very short video) are supported.
const MAX_MEDIA_BYTES = 4 * 1024 * 1024;
const ACCEPTED_PREFIXES = ["audio/", "video/"];

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  const supabase = await createClient();
  const quota = await checkGeminiAiQuota(supabase, userId);
  if (!quota.allowed) {
    return NextResponse.json({ error: GEMINI_AI_LIMIT_MESSAGE }, { status: 429 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (!ACCEPTED_PREFIXES.some((prefix) => file.type.startsWith(prefix))) {
    return NextResponse.json(
      { error: "Only audio or video files are supported." },
      { status: 400 },
    );
  }
  if (file.size > MAX_MEDIA_BYTES) {
    return NextResponse.json(
      { error: "That file is too large (max 4MB — short clips only)." },
      { status: 400 },
    );
  }

  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");

  let draft;
  try {
    draft = await transcribeMedia(base64, file.type);
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof AssistantError ? err.message : "Couldn't transcribe that file.",
      },
      { status: 422 },
    );
  }

  await supabase.from("audit_logs").insert({
    user_id: userId,
    action: "transcribe_media",
    target_table: "entries",
    target_id: null,
    risk_level: "low",
    payload: {
      mime_type: file.type,
      size: file.size,
      key_point_count: draft.key_points.length,
    },
  });

  return NextResponse.json({ draft });
}
