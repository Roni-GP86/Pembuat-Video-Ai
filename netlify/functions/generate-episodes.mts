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
    const { storyIdea, count, style, aspectRatio } = await req.json();
    const customKey = req.headers.get("x-custom-api-key") || undefined;

    if (!storyIdea) {
      return new Response(JSON.stringify({ error: "Story idea is required" }), { status: 400, headers: corsHeaders });
    }

    const activeKey = customKey || process.env.GEMINI_API_KEY;
    const stepsCount = Math.min(count || 3, 6);
    let result: any = null;

    const isEducation = storyIdea.toLowerCase().includes("sekolah")
      || storyIdea.toLowerCase().includes("murid")
      || storyIdea.toLowerCase().includes("belajar")
      || storyIdea.toLowerCase().includes("guru")
      || storyIdea.toLowerCase().includes("sd");

    if (activeKey) {
      try {
        const ai = getGeminiClient(customKey);

        const systemInstruction = `Kamu adalah sutradara sinematik dan seniman storyboard profesional yang ahli dalam narasi budaya Indonesia.
Buat ${stepsCount} episode storyboard berurutan dari satu konsep cerita.

ATURAN KARAKTER INDONESIA WAJIB:
- Semua karakter HARUS tampak Indonesia asli: kulit sawo matang/cokelat hangat, rambut hitam lurus, wajah khas Jawa/Sunda/Melayu/Batak
- JANGAN gunakan karakter bergaya Barat/Eropa

${isEducation ? `SERAGAM SD INDONESIA (WAJIB untuk tema pendidikan):
- Murid laki-laki: kemeja putih bersih lengan pendek, CELANA PENDEK MERAH (di atas lutut), sabuk hitam, sepatu hitam, kaos kaki putih
- Murid perempuan: kemeja putih lengan pendek, ROK PENDEK MERAH (di atas lutut), sepatu hitam, kaos kaki putih
- Detail tambahan: lencana OSIS di dada kiri, tas ransel sekolah
- Guru: kemeja batik PGRI biru-putih atau seragam dinas cokelat` : ""}

ATURAN KONSISTENSI KARAKTER:
1. SEMUA episode WAJIB menampilkan karakter SAMA PERSIS — wajah, rambut, tubuh, warna pakaian identik di setiap adegan
2. DURASI: Setiap prompt episode WAJIB menyebutkan "15 detik" secara eksplisit
3. Ulangi deskripsi fisik karakter KATA PER KATA di setiap "enhancedPrompt" episode
4. "title" WAJIB dalam Bahasa Indonesia yang menarik dan dramatis
5. "enhancedPrompt" WAJIB dalam Bahasa Inggris yang sangat detail untuk generator AI
6. "indonesianNarration" WAJIB 2-3 kalimat Bahasa Indonesia untuk voice-over tiap adegan
7. Gunakan elemen budaya Indonesia: batik, wayang, gamelan, sawah, gunung Bromo, Raja Ampat, makanan lokal

ELEMEN SINEMATIK WAJIB di setiap enhancedPrompt:
- Jenis shot (wide shot, medium shot, close-up, over-shoulder)
- Gerakan kamera (slow pan kiri-kanan, dolly in, tracking shot, crane shot turun)
- Pencahayaan (sinar matahari pagi emas, lampu kelas, sinar bulan)
- Atmosfer (angin sepoi, debu beterbangan, daun bergoyang, aroma tanah basah)

Balas HANYA JSON valid sesuai skema ini:
{
  "characterDescription": "deskripsi fisik sangat detail karakter utama (wajah, rambut, kulit, pakaian, aksesoris)",
  "episodes": [
    {
      "number": 1,
      "title": "Judul Adegan Bahasa Indonesia yang Menarik",
      "enhancedPrompt": "Prompt visual bahasa Inggris sangat detail dengan deskripsi karakter diulang + durasi 15 detik + kamera + pencahayaan + atmosfer",
      "indonesianNarration": "2-3 kalimat narasi bahasa Indonesia untuk voice-over adegan ini"
    }
  ]
}

Kembalikan HANYA JSON mentah valid — tanpa markdown, tanpa codeblock, tanpa teks lain.`;

        const userMsg = `Buat ${stepsCount} adegan storyboard berurutan untuk: "${storyIdea}"
Gaya seni: ${style || "Realistis"}
Rasio: ${aspectRatio || "16:9"}
${isEducation ? "WAJIB: Gunakan murid SD Indonesia berseragam PUTIH + MERAH PENDEK!" : ""}
Pastikan karakter utama IDENTIK PERSIS di semua adegan.`;

        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: userMsg,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            temperature: 0.8,
          },
        });

        const text = response.text?.trim() || "";
        try {
          result = JSON.parse(text);
        } catch {
          result = JSON.parse(text.replace(/```json|```/gi, "").trim());
        }
      } catch (innerErr: any) {
        console.warn("Gemini storyboard generation failed:", innerErr.message);
      }
    }

    // ── Local fallback ──────────────────────────────────────────────────────
    if (!result) {
      const charDesc = isEducation
        ? "Murid SD Indonesia laki-laki, usia 9-10 tahun, kulit sawo matang, rambut hitam pendek lurus, mata cokelat gelap. Berpakaian kemeja putih bersih lengan pendek, celana pendek merah di atas lutut, sabuk hitam, sepatu hitam mengkilap, kaos kaki putih pendek, lencana OSIS di dada kiri."
        : `Karakter protagonis Indonesia dalam gaya ${style || "Realistis"} yang sesuai tema cerita.`;

      const titlePool = [
        "Awal yang Penuh Harapan", "Tantangan Pertama", "Penemuan Luar Biasa",
        "Puncak Petualangan", "Momen Keberanian", "Akhir yang Membahagiakan",
      ];

      result = {
        characterDescription: charDesc,
        episodes: Array.from({ length: stepsCount }, (_, idx) => {
          const n = idx + 1;
          const envDesc = isEducation
            ? "Indonesian elementary school classroom, wooden desks, black chalkboard with colorful chalk, Pancasila poster on pastel yellow wall, jalousie windows with golden morning sunlight"
            : `dramatic ${style || "Realistic"} Indonesian environment`;

          return {
            number: n,
            title: `Adegan ${n}: ${titlePool[idx] || `Episode ${n}`}`,
            enhancedPrompt: `This 15-second cinematic shot features ${charDesc} — ${n === 1 ? "beginning the journey with hopeful expression" : n === stepsCount ? "triumphantly achieving the goal with proud smile" : "facing challenges with determination"}. Setting: ${envDesc}. ${style || "Realistic"} art style, slow tracking camera at eye level, warm golden lighting, soft atmospheric depth of field, gentle ambient movement. Aspect ratio ${aspectRatio || "16:9"}.`,
            indonesianNarration: n === 1
              ? `Kisah yang menakjubkan ini dimulai dengan penuh semangat dan harapan. ${storyIdea} — sebuah perjalanan yang tidak akan terlupakan.`
              : n === stepsCount
              ? `Akhirnya, perjuangan panjang itu berbuah manis. Inilah momen kemenangan yang selalu dinantikan oleh semua.`
              : `Perjalanan terus berlanjut dengan penuh kejutan dan rintangan yang harus dihadapi. Setiap langkah semakin mendekatkan pada tujuan yang diimpikan.`,
          };
        }),
      };
    }

    // ── Attach thumbnail image URLs ─────────────────────────────────────────
    if (result?.episodes) {
      const isPortrait = aspectRatio === "9:16";
      const dim = isPortrait ? "720x1280" : "1200x675";

      result.episodes = result.episodes.map((ep: any, index: number) => {
        if (ep.imageUrl) return ep;

        const combined = `${ep.title || ""} ${ep.enhancedPrompt || ""}`.toLowerCase();
        let keywords = "";

        if (combined.includes("butterfly") || combined.includes("kupu")) keywords = "butterfly metamorphosis nature";
        else if (combined.includes("bear") || combined.includes("beruang")) keywords = "cute bear forest adventure";
        else if (combined.includes("minecraft") || combined.includes("voxel")) keywords = "minecraft voxel landscape";
        else if (combined.includes("free fire") || combined.includes("battle")) keywords = "epic warrior action combat";
        else if (combined.includes("space") || combined.includes("galaxy")) keywords = "outer space galaxy stars";
        else if (combined.includes("sekolah") || combined.includes("school") || combined.includes("murid") || combined.includes("classroom")) keywords = "indonesian school children classroom";
        else if (combined.includes("desa") || combined.includes("village") || combined.includes("sawah")) keywords = "indonesia village rice field";
        else if (combined.includes("bromo") || combined.includes("volcano")) keywords = "bromo volcano indonesia landscape";
        else if (combined.includes("laut") || combined.includes("ocean") || combined.includes("raja ampat")) keywords = "raja ampat indonesia ocean";
        else if (combined.includes("hutan") || combined.includes("forest") || combined.includes("jungle")) keywords = "tropical rainforest indonesia";
        else {
          const pools = ["indonesia nature sunrise", "cinematic landscape dramatic light", "tropical paradise golden hour", "indonesian culture traditional", "adventure journey indonesia"];
          keywords = pools[index % pools.length];
        }

        const url = `https://images.unsplash.com/featured/${dim}/?${encodeURIComponent(keywords)}&sig=${Date.now() + index * 7}`;
        return { ...ep, imageUrl: url };
      });
    }

    return new Response(JSON.stringify(result), { headers: corsHeaders });
  } catch (error: any) {
    console.error("Error in generate-episodes:", error);
    return new Response(
      JSON.stringify({ error: "Gagal membuat storyboard: " + error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
};

export const config = { path: "/api/generate-episodes" };
