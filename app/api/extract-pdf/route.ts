import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import { getCurrentUserId } from "@/lib/data/entries";

export const maxDuration = 60;

const MAX_FILE_BYTES = 15 * 1024 * 1024; // 15MB
const MAX_TEXT_CHARS = 20000;
const MIN_MEANINGFUL_CHARS = 40;

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ error: "Only .pdf files are supported here." }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "That file is too large (max 15MB)." }, { status: 400 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  let parser: PDFParse | null = null;
  try {
    parser = new PDFParse({ data: bytes });
    const result = await parser.getText();
    const text = result.text.trim();

    if (text.length < MIN_MEANINGFUL_CHARS) {
      return NextResponse.json(
        {
          error:
            "Couldn't extract readable text from this PDF. It may be a scanned or image-based document.",
        },
        { status: 422 },
      );
    }

    const truncated = text.length > MAX_TEXT_CHARS;
    return NextResponse.json({
      text: truncated ? text.slice(0, MAX_TEXT_CHARS) : text,
      truncated,
      pageCount: result.total,
    });
  } catch {
    return NextResponse.json(
      { error: "Couldn't read that PDF. It may be corrupted or password-protected." },
      { status: 422 },
    );
  } finally {
    await parser?.destroy();
  }
}
