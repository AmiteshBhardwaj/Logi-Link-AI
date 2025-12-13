import { NextRequest, NextResponse } from "next/server";
import { ingestDocument } from "@/lib/embeddings/vectorStore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body?.text || !body?.contractId) {
      return NextResponse.json({ error: "contractId and text are required" }, { status: 400 });
    }
    const result = await ingestDocument({
      contractId: Number(body.contractId),
      text: body.text,
      documentName: body.documentName || "Uploaded document"
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Ingestion failed", error);
    return NextResponse.json({ error: "Ingestion failed" }, { status: 500 });
  }
}

