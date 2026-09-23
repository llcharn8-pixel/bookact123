import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";

export async function GET() {
  try {
    const res = await fetch("https://bitcoin.org/bitcoin.pdf");
    const bytes = new Uint8Array(await res.arrayBuffer());
    const parser = new PDFParse({ data: bytes });
    const result = await parser.getText();
    await parser.destroy();
    return NextResponse.json({ ok: true, length: result.text.length, pages: result.total });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
