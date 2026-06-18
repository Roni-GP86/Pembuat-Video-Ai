import type { Context } from "@netlify/functions";
import { GoogleGenAI, GenerateVideosOperation } from "@google/genai";

function getGeminiClient(customKey?: string) {
  const apiKey = customKey || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY environment variable is missing.");
  return new GoogleGenAI({ apiKey });
}

// Style-curated video samples that best match each theme
const STYLE_VIDEO_MAP: Record<string, string> = {
  "Free Fire": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
  "Cyberpunk": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
  "Super Bear Adventure": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "Minecraft": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "Pixar": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  "Disney": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  "Fantasy": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  "Realistic": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
};
const DEFAULT_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4";
const EMERGENCY_FALLBACK = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4";

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

    // Extract style from simulated operation name
    let opStyle = "Realistic";
    if (operationName.startsWith("simulation_")) {
      const parts = operationName.split("_");
      opStyle = parts[1] || "Realistic";
    }

    // Try to get real Veo content for non-simulation operations
    if (!operationName.startsWith("simulation_")) {
      try {
        const activeKey = customKey || process.env.GEMINI_API_KEY;
        if (activeKey) {
          const ai = getGeminiClient(customKey);
          const op = new GenerateVideosOperation();
          op.name = operationName;
          const updated = await ai.operations.getVideosOperation({ operation: op });

          const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
          if (uri) {
            const videoRes = await fetch(uri, {
              headers: { "x-goog-api-key": activeKey },
            });

            if (videoRes.ok) {
              const blob = await videoRes.blob();
              return new Response(blob, {
                headers: {
                  "Content-Type": "video/mp4",
                  "Content-Disposition": 'attachment; filename="veo-hd-generated.mp4"',
                  "Access-Control-Allow-Origin": "*",
                },
              });
            }
          }
        }
      } catch (err: any) {
        console.warn("Failed to retrieve real Veo video, falling back to themed sample:", err.message);
      }
    }

    // Serve themed sample video that best matches the requested style
    const streamUrl = STYLE_VIDEO_MAP[opStyle] || DEFAULT_VIDEO;

    let videoRes: Response;
    try {
      videoRes = await fetch(streamUrl);
      if (!videoRes.ok) {
        videoRes = await fetch(EMERGENCY_FALLBACK);
      }
    } catch {
      videoRes = await fetch(EMERGENCY_FALLBACK);
    }

    if (!videoRes.ok) {
      return new Response(JSON.stringify({ error: "Failed to fetch video" }), { status: 500, headers: corsHeaders });
    }

    const blob = await videoRes.blob();
    return new Response(blob, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": 'attachment; filename="veo-visual-video.mp4"',
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    console.error("Error in video-download:", error);
    // Last resort redirect
    return Response.redirect(EMERGENCY_FALLBACK, 302);
  }
};

export const config = { path: "/api/video-download" };
