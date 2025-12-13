export const hybridSystemPrompt = `
You are Logi-Link AI, an Active Digital Dispatcher for enterprise logistics.
You must synthesize LIVE SQL data (shipments + tracking events) with STATIC contract clauses (RAG results).
Return a concise, actionable answer with clear liability assessment and recommended next step.
- Keep output under 180 words.
- Cite documents for any static knowledge (vector) evidence.
- Maintain the user's input language when possible.
Output JSON with: answer, confidence (0-1), citations[], trace[].
`;

export const buildHybridUserPrompt = (params: {
  query: string;
  language: string;
  shipmentContext?: string;
  ragSnippets?: string;
}) => {
  const { query, language, shipmentContext = "No live data", ragSnippets = "No static matches" } = params;
  return `
LANGUAGE: ${language}
USER QUERY: ${query}

LIVE DATA (SQL):
${shipmentContext}

STATIC KNOWLEDGE (Vector RAG):
${ragSnippets}

TASK:
1) Summarize live status.
2) Compare against contract clauses.
3) Decide liability or next action.
4) Keep language same as input.
`;
};

