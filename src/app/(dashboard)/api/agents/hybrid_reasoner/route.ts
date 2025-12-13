import { NextRequest, NextResponse } from "next/server";
import { runHybridReasoner } from "../hybrid_reasoner";
import type { ReasoningRequest } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ReasoningRequest;
    if (!body?.query) {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }
    const result = await runHybridReasoner(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Hybrid reasoner failed:", error);
    const errorMessage = error instanceof Error ? error.message : "Hybrid reasoning failed";
    const errorStack = error instanceof Error ? error.stack : undefined;
    return NextResponse.json(
      { 
        error: errorMessage, 
        details: process.env.NODE_ENV === "development" ? (errorStack || String(error)) : undefined 
      },
      { status: 500 }
    );
  }
}

