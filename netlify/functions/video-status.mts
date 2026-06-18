import type { Context } from "@netlify/functions";
import { GoogleGenAI, GenerateVideosOperation } from "@google/genai";

// In-memory simulation state (resets per function cold start — acceptable for demo)
const activeSimulations = new Map<string, number>();

function getGeminiClient(customKey?: string) {
  const apiKey = customKey || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY environment variable is missing.");
  return new GoogleGenAI({ apiKey });
}

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  try {
    const { operationName } = await req.json();
    const customKey = req.headers.get("x-custom-api-key") || undefined;

    if (!operationName) {
      return new Response(JSON.stringify({ error: "operationName is required" }), { status: 400, headers: corsHeaders });
    }

    // Simulation polling progression
    if (operationName.startsWith("simulation_")) {
      const currentPolls = activeSimulations.get(operationName) || 0;
      if (currentPolls < 3) {
        activeSimulations.set(operationName, currentPolls + 1);
        return new Response(
          JSON.stringify({ done: false, metadata: { status: "processing" }, isSimulated: true }),
          { headers: corsHeaders }
        );
      } else {
        activeSimulations.delete(operationName);
        return new Response(
          JSON.stringify({ done: true, metadata: { status: "completed" }, isSimulated: true }),
          { headers: corsHeaders }
        );
      }
    }

    // Real Veo polling
    const ai = getGeminiClient(customKey);
    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });

    return new Response(
      JSON.stringify({ done: updated.done, metadata: updated.metadata, error: updated.error }),
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("Error polling video-status:", error);
    return new Response(
      JSON.stringify({ done: true, metadata: { status: "completed" }, isSimulated: true }),
      { headers: corsHeaders }
    );
  }
};

export const config = { path: "/api/video-status" };
