import React, { useEffect, useState, useRef } from "react";
import { Play, Pause, Download, AlertTriangle, Sparkles, RefreshCw, Film, HelpCircle } from "lucide-react";

interface VeoPlayerProps {
  prompt: string;
  style: string;
  aspectRatio: string;
  duration: number;
  uploadedImage: string | null;
  onFallbackToggle: () => void;
  customApiKey?: string;
  themeId?: string;
}

const CREATIVE_MESSAGES = [
  "Menganalisis ide gerak visual...",
  "Menginisialisasi pustaka gaya AI...",
  "Menghubungkan frame pertama ke model Veo...",
  "Membuat lintasan animasi kamera...",
  "Merancang tekstur dan kedalaman gaya Pixar/Disney...",
  "Mengekstrak bayangan volumetrik...",
  "Mengompilasi video berkecepatan 30fps...",
  "Menyempurnakan transisi antar-pixel...",
  "Finalisasi render audio suasana...",
  "Hampir selesai! Sedang mengompresi file .mp4..."
];

export default function VeoPlayer({
  prompt,
  style,
  aspectRatio,
  duration,
  uploadedImage,
  onFallbackToggle,
  customApiKey = "",
  themeId = ""
}: VeoPlayerProps) {
  const [operationName, setOperationName] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "generating" | "polling" | "downloading" | "completed" | "error">("idle");
  const [progressMsgIndex, setProgressMsgIndex] = useState(0);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);
  const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null);
  const [videoPlayerUrl, setVideoPlayerUrl] = useState<string | null>(null);
  const [requiresPaid, setRequiresPaid] = useState(false);

  const pollIntervalRef = useRef<any>(null);
  const msgIntervalRef = useRef<any>(null);

  // Cycle reassuring message indexes
  useEffect(() => {
    if (status === "generating" || status === "polling" || status === "downloading") {
      msgIntervalRef.current = setInterval(() => {
        setProgressMsgIndex((prev) => (prev + 1) % CREATIVE_MESSAGES.length);
      }, 7000);
    } else {
      clearInterval(msgIntervalRef.current);
    }
    return () => clearInterval(msgIntervalRef.current);
  }, [status]);

  // Clean up blob URLs
  useEffect(() => {
    return () => {
      if (videoBlobUrl) URL.revokeObjectURL(videoBlobUrl);
    };
  }, [videoBlobUrl]);

  // Launch actual Veo generation
  const startVeoGeneration = async () => {
    setStatus("generating");
    setErrorInfo(null);
    setRequiresPaid(false);
    setProgressMsgIndex(0);

    try {
      const response = await fetch("/api/generate-video", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-custom-api-key": customApiKey 
        },
        body: JSON.stringify({
          prompt,
          style,
          aspectRatio,
          duration,
          image: uploadedImage // Will trigger Image-to-Video if provided
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        if (errData.requiresPaidPlan) {
          setRequiresPaid(true);
          throw new Error(errData.message || "Paid API Key required");
        }
        throw new Error(errData.error || "Gagal menginisiasi generat video.");
      }

      const data = await response.json();
      if (data.operationName) {
        setOperationName(data.operationName);
        setStatus("polling");
        startPolling(data.operationName);
      } else {
        throw new Error("Gagal memperoleh nama operasi dari API.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorInfo(err.message || "Gagal memproses video.");
      setStatus("error");
    }
  };

  // Start polling mechanism
  const startPolling = (opName: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch("/api/video-status", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "x-custom-api-key": customApiKey
          },
          body: JSON.stringify({ operationName: opName }),
        });

        if (!response.ok) {
          throw new Error("Gagal memeriksa status proses.");
        }

        const data = await response.json();
        
        if (data.error) {
          clearInterval(pollIntervalRef.current);
          throw new Error(data.error.message || "Proses rendering video gagal di server AI.");
        }

        if (data.done) {
          clearInterval(pollIntervalRef.current);
          setStatus("downloading");
          downloadAndPipeVideo(opName);
        }
      } catch (err: any) {
        console.error(err);
        clearInterval(pollIntervalRef.current);
        setErrorInfo(err.message || "Gagal mengecek progres.");
        setStatus("error");
      }
    }, 6000); // Poll every 6 seconds
  };

  // Download video from server and create safe Blob URL
  const downloadAndPipeVideo = async (opName: string) => {
    try {
      const response = await fetch("/api/video-download", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-custom-api-key": customApiKey },
        body: JSON.stringify({
          operationName: opName,
          promptContext: prompt,
          themeIdContext: themeId,
          styleContext: style
        }),
      });

      if (!response.ok) {
        throw new Error("Server gagal mengunduh hasil render video.");
      }

      const blob = await response.blob();
      const localUrl = URL.createObjectURL(blob);
      setVideoBlobUrl(localUrl);
      setVideoPlayerUrl(localUrl);
      setStatus("completed");
    } catch (err: any) {
      console.error(err);
      setErrorInfo(err.message || "Gagal mengunduh file video hasil.");
      setStatus("error");
    }
  };

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const handleDownloadFile = () => {
    if (!videoBlobUrl) return;
    const a = document.createElement("a");
    a.href = videoBlobUrl;
    a.download = `veo-ai-video-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const isPortrait = aspectRatio === "9:16";
  const aspectClass = isPortrait 
    ? "aspect-[9/16] w-full max-w-[340px] mx-auto rounded-3xl" 
    : "aspect-[16/9] w-full rounded-2xl";

  return (
    <div className="w-full flex flex-col items-center select-none" id="veo-player">
      
      {/* Player Frame */}
      <div 
        className={`relative ${aspectClass} overflow-hidden shadow-2xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-center`}
      >
        {status === "idle" && (
          <div className="p-6 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-violet-600/10 border border-violet-500/30 flex items-center justify-center shadow-lg shadow-violet-950/20 text-violet-400">
              <Film className="w-8 h-8" />
            </div>
            <div className="max-w-md">
              <h4 className="text-sm font-semibold text-zinc-200">
                Hubungkan ke Veo 3D AI Engine
              </h4>
              <p className="text-xs text-zinc-400 mt-1 px-4 leading-relaxed">
                Menghasilkan video asli yang dinamis dan beresolusi tajam menggunakan kecerdasan buatan kelas premium <strong>Google Veo</strong>.
              </p>
            </div>
            <button
              onClick={startVeoGeneration}
              className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-violet-950/30 active:scale-[0.98] transition-all flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-violet-200" />
              <span>Mulai Render Veo AI</span>
            </button>
          </div>
        )}

        {(status === "generating" || status === "polling" || status === "downloading") && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-zinc-950/90 text-center">
            {/* Spinning indicator with style thematic glowing core */}
            <div className="relative flex items-center justify-center mb-6">
              <div className="w-20 h-20 border-4 border-violet-500/10 border-t-violet-500 rounded-full animate-spin"></div>
              <div className="absolute w-12 h-12 bg-indigo-500/10 rounded-full blur-md animate-pulse"></div>
              <Film className="w-6 h-6 text-violet-400 absolute" />
            </div>

            <div className="space-y-2 max-w-xs">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-violet-400">
                {status === "downloading" ? "Mengunduh File Video" : "Rendering Veo AI"}
              </span>
              <p className="text-sm font-medium text-zinc-200">
                {CREATIVE_MESSAGES[progressMsgIndex]}
              </p>
              <p className="text-[11px] text-zinc-500 leading-relaxed px-4">
                Proses rendering Veo membutuhkan waktu berkisar 2-5 menit karena memproses jutaan partikel visual. Jangan tutup tab browser Anda.
              </p>
            </div>

            {/* Quick action to toggle to Fallback Canvas instantly */}
            <div className="mt-8 border-t border-zinc-800/60 pt-4 w-full max-w-[240px]">
              <span className="text-[10px] text-zinc-500 block mb-2">Ingin hasil instan tanpa antrean?</span>
              <button 
                onClick={onFallbackToggle}
                className="w-full text-center text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline transition"
              >
                Ganti ke Demo Animasi Instan &rarr;
              </button>
            </div>
          </div>
        )}

        {status === "completed" && videoPlayerUrl && (
          <video 
            src={videoPlayerUrl}
            controls
            autoPlay
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        )}

        {status === "error" && (
          <div className="p-6 text-center flex flex-col items-center justify-center space-y-4 max-w-sm">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-100">
                Gagal Menghubungkan Veo AI
              </h4>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                {errorInfo || "Koneksi ke server Google Veo AI terputus."}
              </p>
              <div className="mt-3 bg-zinc-900/80 border border-zinc-800 p-2.5 rounded-lg text-[11px] text-amber-500/90 text-left space-y-1.5">
                <p className="font-semibold">Solusi & Alternatif:</p>
                <p>1. Aktifkan Kunci API Berbayar dari setelan AI Studio.</p>
                <p>2. Gunakan <strong>Demo Kamera Sinematik</strong> untuk melihat efek animasi game <strong>Free Fire</strong>, <strong>Super Bear Adventure</strong>, atau <strong>Minecraft</strong> secara instan dengan soundscape interaktif yang megah!</p>
              </div>
            </div>

            <div className="flex flex-col space-y-2 w-full pt-2">
              <button
                onClick={startVeoGeneration}
                className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs rounded-xl transition"
              >
                Coba Lagi
              </button>
              <button
                onClick={onFallbackToggle}
                className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs rounded-xl shadow-md transition"
              >
                Pakai Demo Kamera Sinematik
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controller section below video */}
      {status === "completed" && (
        <div className="mt-3 w-full flex items-center justify-between bg-zinc-900/60 border border-zinc-800/80 px-4 py-2.5 rounded-xl">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
              Veo HD AI Engine Output
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={startVeoGeneration}
              className="p-1.5 hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 rounded-lg transition"
              title="Render generate video baru"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownloadFile}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs rounded-lg transition flex items-center space-x-1.5 shadow-sm"
              title="Unduh video MP4 hasil"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh MP4</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
