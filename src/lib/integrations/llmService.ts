import { ChatOpenAI } from "@langchain/openai";
import { StructuredOutputParser } from "langchain/output_parsers";
import { z } from "zod";

const openaiApiKey = process.env.OPENAI_API_KEY;
if (!openaiApiKey) {
  throw new Error("OPENAI_API_KEY environment variable is required. Please set it in your .env.local file.");
}

const llmModel = process.env.LLM_MODEL || "gpt-4o-mini";

export type LlmMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const ReasoningSchema = z.object({
  answer: z.string(),
  confidence: z.number().optional(),
  citations: z
    .array(
      z.object({
        document_id: z.number(),
        snippet: z.string().optional(),
        similarity: z.number().optional()
      })
    )
    .optional(),
  trace: z.array(z.string()).optional(),
  language: z.string().optional()
});

export async function callLLM(messages: LlmMessage[], options?: { temperature?: number }) {
  const parser = StructuredOutputParser.fromZodSchema(ReasoningSchema);
  const format = parser.getFormatInstructions();

  const llm = new ChatOpenAI({
    modelName: llmModel,
    temperature: options?.temperature ?? 0.2,
    apiKey: openaiApiKey
  });

  const completion = await llm.call(
    [
      {
        role: "system",
        content:
          "You are Logi-Link AI, a bilingual logistics analyst. Respond concisely, cite sources, and keep language aligned with the user's input language."
      },
      { role: "system", content: `Follow this JSON schema strictly:\n${format}` },
      ...messages
    ]
  );

  return parser.parse(completion.content as string);
}

