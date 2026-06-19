import type { Context } from "@netlify/functions";
import { GoogleGenAI } from "@google/genai";

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
    const { topic, subTopic, themeId, style, audience, duration } = await req.json();
    const customKey = req.headers.get("x-custom-api-key") || undefined;

    if (!topic && !subTopic) {
      return new Response(JSON.stringify({ error: "topic or subTopic required" }), { status: 400, headers: corsHeaders });
    }

    const mainTopic = subTopic || topic;
    const activeKey = customKey || process.env.GEMINI_API_KEY;
    const animDuration = duration || 60;
    const artStyle = style || "Pixar";

    const buildFallback = () => {
      const charName = "Dika";
      const sceneCount = Math.max(3, Math.floor(animDuration / 20));
      return {
        title: `Petualangan Ilmiah: ${mainTopic}`,
        mainCharacter: {
          name: charName,
          description: `Indonesian elementary school boy age 10, wearing red-white school uniform, short black hair, carrying yellow notebook, ${artStyle} 3D animation`,
          personality: "Penasaran, cerdas, suka berbagi pengetahuan"
        },
        educationalObjective: `Siswa memahami konsep ${mainTopic} melalui cerita naratif yang menarik`,
        scenes: Array.from({ length: sceneCount }, (_, i) => ({
          number: i + 1,
          name: i === 0 ? "Awal Petualangan" : i === sceneCount - 1 ? "Kesimpulan Belajar" : `Proses ${mainTopic} Bagian ${i + 1}`,
          durationSeconds: Math.floor(animDuration / sceneCount),
          visualPrompt: `Scene ${i + 1} of ${sceneCount}: ${charName}, Indonesian 10yo boy in red-white school uniform, explaining ${mainTopic} enthusiastically. ${artStyle} animation, warm classroom lighting, educational posters background, slow cinematic pan, 16:9 framing`,
          dialogue: [
            {
              character: charName,
              text: i === 0
                ? `Halo teman-teman! Hari ini aku mau bercerita tentang ${mainTopic} yang sangat menakjubkan!`
                : i === sceneCount - 1
                  ? `Nah, sekarang kalian sudah tahu kan? ${mainTopic} sungguh keren sekali!`
                  : `Dan perhatikan apa yang terjadi selanjutnya dalam proses ${mainTopic} ini!`,
              emotion: i === 0 ? "bersemangat" : i === sceneCount - 1 ? "bangga" : "antusias"
            },
            {
              character: "NARATOR",
              text: i === 0
                ? `Bergabunglah bersama ${charName} dalam petualangan ilmiah yang menakjubkan hari ini!`
                : i === sceneCount - 1
                  ? `Dan itulah keajaiban ${mainTopic}! Alam kita sungguh luar biasa, bukan?`
                  : `Perhatikan dengan seksama setiap detail yang terjadi...`,
              emotion: "hangat dan inspiratif"
            }
          ],
          soundAndMusic: i === 0
            ? "Musik pembuka ceria, lonceng sekolah"
            : i === sceneCount - 1
              ? "Musik penutup inspiratif, tepuk tangan"
              : "Musik petualangan penasaran, efek suara alam",
          teachingPoint: `Pemahaman aspek ${i + 1} dari ${mainTopic}`
        })),
        closingMessage: `Tetap penasaran dan terus belajar! ${mainTopic} adalah satu dari berjuta keajaiban alam yang menunggu kita temukan!`,
        discussionQuestions: [
          `Apa yang paling menarik dari ${mainTopic}?`,
          `Bisakah kamu jelaskan proses ${mainTopic} dengan kata-katamu sendiri?`,
          `Di mana kamu bisa melihat contoh ${mainTopic} dalam kehidupan sehari-hari?`
        ],
        fullNarrativeText: `Halo teman-teman! Hari ini kita belajar bersama ${charName} tentang ${mainTopic}. Ikuti ceritanya dan temukan keajaiban di dalamnya!`
      };
    };

    if (activeKey) {
      try {
        const ai = getGeminiClient(customKey);
        const sysInst = `Kamu adalah penulis skrip video edukasi animasi profesional untuk anak-anak Indonesia.
Buat SKRIP VIDEO NARATIF LENGKAP dengan PERCAKAPAN KARAKTER untuk video animasi edukasi.
ATURAN WAJIB:
1. Buat karakter anak Indonesia (nama lokal) yang bercerita/menjelaskan topik dengan antusias dan menyenangkan
2. Sertakan DIALOG PERCAKAPAN natural, menarik, dan edukatif di SETIAP adegan
3. Setiap adegan punya DESKRIPSI VISUAL DETAIL dalam Bahasa Inggris untuk AI video generator  
4. Gunakan pendekatan DONGENG ILMIAH - fakta akurat dikemas seperti cerita menarik
5. Sertakan instruksi efek suara, musik latar, dan ambient audio yang spesifik
6. Durasi total: ${animDuration} detik
Kembalikan HANYA JSON valid (tanpa markdown/code block):
{"title":"Judul","mainCharacter":{"name":"Nama","description":"Deskripsi visual detail untuk AI","personality":"Sifat"},"educationalObjective":"Tujuan","scenes":[{"number":1,"name":"Nama","durationSeconds":20,"visualPrompt":"Visual SANGAT DETAIL dalam Bahasa Inggris - lokasi, pencahayaan, kamera, ekspresi, efek, gaya ${artStyle}","dialogue":[{"character":"Nama/NARATOR","text":"Dialog","emotion":"Ekspresi"}],"soundAndMusic":"Instruksi audio","teachingPoint":"Poin pembelajaran"}],"closingMessage":"Pesan penutup","discussionQuestions":["Pertanyaan"],"fullNarrativeText":"Semua dialog berurutan"}`;

        const resp = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: `Buat skrip video edukasi animasi gaya ${artStyle} tentang: "${mainTopic}"\nTema: ${themeId || "Edukasi"}, Penonton: ${audience || "Siswa SD usia 9-12 tahun"}, Durasi: ${animDuration} detik.\nPendekatan: seorang anak bercerita kepada teman-temannya tentang ${mainTopic} secara menarik dengan percakapan natural dan visualisasi yang detail.`,
          config: { systemInstruction: sysInst, responseMimeType: "application/json", temperature: 0.85 }
        });

        const text = resp.text?.trim() || "";
        try {
          return new Response(JSON.stringify({ success: true, narration: JSON.parse(text) }), { headers: corsHeaders });
        } catch {
          return new Response(JSON.stringify({ success: true, narration: JSON.parse(text.replace(/```json|```/gi, "").trim()) }), { headers: corsHeaders });
        }
      } catch (aiErr: any) {
        console.warn("AI narration failed, using fallback:", aiErr.message);
      }
    }

    return new Response(JSON.stringify({ success: true, narration: buildFallback(), isFallback: true }), { headers: corsHeaders });
  } catch (error: any) {
    console.error("Critical narration error:", error);
    return new Response(JSON.stringify({ success: true, narration: null, error: error.message }), { status: 500, headers: corsHeaders });
  }
};

export const config = { path: "/api/generate-narration" };
