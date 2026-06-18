import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

export interface StoryboardScene {
  number: number;
  title: string;
  enhancedPrompt: string;
  imageUrl?: string;
}

interface CinematicPlayerProps {
  imageUrl: string;
  duration: number; // in seconds
  style: string; // "Realistic" | "Pixar" | "Disney" | "Cyberpunk" | "Fantasy"
  aspectRatio: string; // "16:9" | "9:16"
  prompt: string;
  scenes?: StoryboardScene[]; // Optional list of consecutive scenes for full storytelling!
}

export default function CinematicPlayer({
  imageUrl,
  duration,
  style,
  aspectRatio,
  prompt,
  scenes,
}: CinematicPlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);

  // Sound track generator (Web Audio API synthesis for atmospheric drone sound!)
  const audioCtxRef = useRef<AudioContext | null>(null);
  const volumeNodeRef = useRef<GainNode | null>(null);
  const oscillatorNodeRef = useRef<OscillatorNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);

  // Reset scene index when list of scenes changes
  useEffect(() => {
    setCurrentSceneIdx(0);
    setCurrentTime(0);
    setIsPlaying(true);
  }, [scenes]);

  // Determine active visual resources
  const activeImageUrl = (scenes && scenes[currentSceneIdx]?.imageUrl) || imageUrl;
  const activePrompt = (scenes && scenes[currentSceneIdx]?.enhancedPrompt) || prompt;
  const activeTitle = (scenes && scenes[currentSceneIdx]?.title) || "Adegan Aktif";

  // Initialize atmospheric sound drone
  const startAtmosphericSound = () => {
    try {
      if (audioCtxRef.current) return;
      
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      audioCtxRef.current = audioCtx;

      // Base Gain
      const volumeNode = audioCtx.createGain();
      volumeNode.gain.setValueAtTime(isMuted ? 0 : 0.08, audioCtx.currentTime);
      volumeNodeRef.current = volumeNode;

      // Low frequency drone oscillator
      const osc = audioCtx.createOscillator();
      // Match style sound frequency
      let freq = 74.5; // Realistic: deep brown noise drone
      if (style === "Cyberpunk") freq = 55.0; // Synth cyber bass
      if (style === "Disney") freq = 130.8; // Warm whimsical major drone
      if (style === "Free Fire") freq = 65.0; // Aggressive military fire sub
      if (style === "Super Bear Adventure") freq = 220.0; // Cheerful cute retro adventure tone
      if (style === "Minecraft") freq = 98.05; // Coaxial cozy voxel tone
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      oscillatorNodeRef.current = osc;

      // Filter for ambient sweeps
      const filter = audioCtx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(200, audioCtx.currentTime);
      filterNodeRef.current = filter;

      // LFO for sweeping filter
      const lfo = audioCtx.createOscillator();
      lfo.frequency.setValueAtTime(0.2, audioCtx.currentTime); // very slow sweep
      const lfoGain = audioCtx.createGain();
      lfoGain.gain.setValueAtTime(80, audioCtx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();

      osc.connect(filter);
      filter.connect(volumeNode);
      volumeNode.connect(audioCtx.destination);
      osc.start();
    } catch (e) {
      console.warn("Web Audio API not supported or blocked in IFrame:", e);
    }
  };

  const stopAtmosphericSound = () => {
    try {
      if (oscillatorNodeRef.current) {
        oscillatorNodeRef.current.stop();
        oscillatorNodeRef.current.disconnect();
        oscillatorNodeRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    } catch (e) {}
  };

  // Toggle Mute
  useEffect(() => {
    if (volumeNodeRef.current && audioCtxRef.current) {
      const targetGain = isMuted ? 0 : 0.08;
      volumeNodeRef.current.gain.setTargetAtTime(targetGain, audioCtxRef.current.currentTime, 0.2);
    }
  }, [isMuted]);

  // Audio start trigger on playing
  useEffect(() => {
    if (isPlaying) {
      startAtmosphericSound();
    } else {
      stopAtmosphericSound();
    }
    return () => stopAtmosphericSound();
  }, [isPlaying, style]);

  // Image preloading
  const [imageLoaded, setImageLoaded] = useState(false);
  useEffect(() => {
    setImageLoaded(false);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.referrerPolicy = "no-referrer";
    img.onload = () => {
      imgRef.current = img;
      setImageLoaded(true);
    };
    img.src = activeImageUrl;
  }, [activeImageUrl]);

  // Progressive timer with sequential story transitions
  useEffect(() => {
    let timer: any;
    if (isPlaying && imageLoaded) {
      timer = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 0.05;
          if (next >= duration) {
            // Check if there is a next scene in the sequential movie storyboard!
            if (scenes && scenes.length > 0 && currentSceneIdx < scenes.length - 1) {
              setCurrentSceneIdx((prevIdx) => prevIdx + 1);
              return 0; // Reset time back to 0 for the next continuous scene!
            } else {
              setIsPlaying(false);
              return duration;
            }
          }
          return next;
        });
      }, 50);
    }
    return () => clearInterval(timer);
  }, [isPlaying, duration, imageLoaded, scenes, currentSceneIdx]);

  // Sync Progress percentage
  useEffect(() => {
    setProgress((currentTime / duration) * 100);
  }, [currentTime, duration]);

  // Refs for render loop to read fresh values without re-mounting
  const currentTimeRef = useRef(currentTime);
  const isPlayingRef = useRef(isPlaying);
  const styleRef = useRef(style);
  const durationRef = useRef(duration);
  useEffect(() => { currentTimeRef.current = currentTime; }, [currentTime]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { styleRef.current = style; }, [style]);
  useEffect(() => { durationRef.current = duration; }, [duration]);

  // Render Loop & Particle FX — mounted ONCE per image load, uses refs for live data
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageLoaded || !imgRef.current) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animFrame: number;
    let particles: Array<{
      x: number; y: number; vx: number; vy: number;
      size: number; alpha: number; color: string;
      sinVal?: number; sinSpeed?: number;
    }> = [];

    // Resize canvas
    const resizeCanvas = () => {
      const container = containerRef.current;
      if (!container) return;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize particles — reduced counts for performance
    const curStyle = styleRef.current;
    let count = 15;
    if (curStyle === "Cyberpunk" || curStyle === "Free Fire") count = 30;
    else if (curStyle === "Disney" || curStyle === "Super Bear Adventure") count = 25;
    else if (curStyle === "Pixar" || curStyle === "Minecraft") count = 20;

    for (let i = 0; i < count; i++) {
      particles.push(createParticle(canvas.width, canvas.height, curStyle, true));
    }

    function createParticle(w: number, h: number, fxStyle: string, randomY = false) {
      const sc = getStyleColors(fxStyle);
      const isRising = fxStyle === "Cyberpunk" || fxStyle === "Free Fire" || fxStyle === "Fantasy";
      return {
        x: Math.random() * w,
        y: randomY ? Math.random() * h : isRising ? h + 10 : -10,
        vx: (Math.random() - 0.5) * sc.vxRange + sc.baseVx,
        vy: (Math.random() - 0.5) * sc.vyRange + sc.baseVy,
        size: Math.random() * sc.sizeRange + sc.baseSize,
        alpha: Math.random() * 0.6 + 0.2,
        color: sc.colors[Math.floor(Math.random() * sc.colors.length)],
        sinVal: Math.random() * Math.PI,
        sinSpeed: Math.random() * 0.03 + 0.01,
      };
    }

    function getStyleColors(fxStyle: string) {
      switch (fxStyle) {
        case "Cyberpunk":
          return { colors: ["rgb(255,0,128)", "rgb(0,240,255)", "rgb(255,230,0)"], baseVx: 0, baseVy: -1.2, vxRange: 0.8, vyRange: 1.0, baseSize: 1.5, sizeRange: 2.5 };
        case "Free Fire":
          return { colors: ["rgb(249,115,22)", "rgb(239,68,68)", "rgb(234,179,8)"], baseVx: 0.1, baseVy: -2.2, vxRange: 1.5, vyRange: 1.8, baseSize: 2.0, sizeRange: 3.5 };
        case "Super Bear Adventure":
          return { colors: ["rgb(250,204,21)", "rgb(96,165,250)", "rgb(244,114,182)"], baseVx: 0.2, baseVy: 0.5, vxRange: 1.0, vyRange: 0.8, baseSize: 3.5, sizeRange: 4.5 };
        case "Minecraft":
          return { colors: ["rgb(34,197,94)", "rgb(132,204,22)", "rgb(180,83,9)"], baseVx: 0, baseVy: 0.9, vxRange: 0.4, vyRange: 0.7, baseSize: 5.0, sizeRange: 4.0 };
        case "Disney":
          return { colors: ["rgba(255,255,255,0.9)", "rgba(253,224,71,0.8)", "rgba(196,181,253,0.8)"], baseVx: 0.3, baseVy: 0.5, vxRange: 0.4, vyRange: 0.6, baseSize: 1.0, sizeRange: 3.0 };
        case "Pixar":
          return { colors: ["rgba(250,204,21,0.9)", "rgba(251,146,60,0.8)", "rgba(56,189,248,0.7)"], baseVx: 0, baseVy: 0.3, vxRange: 0.5, vyRange: 0.5, baseSize: 2.0, sizeRange: 4.0 };
        case "Fantasy":
          return { colors: ["rgba(139,92,246,0.8)", "rgba(236,72,153,0.7)", "rgba(16,185,129,0.7)"], baseVx: 0.1, baseVy: -0.2, vxRange: 0.6, vyRange: 0.6, baseSize: 1.5, sizeRange: 3.5 };
        default:
          return { colors: ["rgba(200,225,255,0.6)", "rgba(255,255,255,0.4)"], baseVx: -0.8, baseVy: 5.5, vxRange: 0.2, vyRange: 1.5, baseSize: 0.8, sizeRange: 0.8 };
      }
    }

    // Throttle to ~30fps for performance
    let lastFrameTime = 0;
    const FRAME_INTERVAL = 1000 / 30;

    const render = (time: number) => {
      const delta = time - lastFrameTime;
      if (delta < FRAME_INTERVAL) {
        animFrame = requestAnimationFrame(render);
        return;
      }
      lastFrameTime = time;

      if (!imgRef.current) { animFrame = requestAnimationFrame(render); return; }
      const cw = canvas.width, ch = canvas.height;
      const ct = currentTimeRef.current;
      const dur = durationRef.current;
      const playing = isPlayingRef.current;
      const st = styleRef.current;

      ctx.clearRect(0, 0, cw, ch);

      // 1. Ken Burns — zoom & pan
      const zoomFactor = 1.05 + Math.sin((ct / dur) * Math.PI * 0.15) * 0.08;
      const panX = Math.cos((ct / dur) * Math.PI * 0.2) * 15;
      const panY = Math.sin((ct / dur) * Math.PI * 0.2) * 10;

      const img = imgRef.current;
      const imgAspect = img.width / img.height;
      const canvasAspect = cw / ch;
      let dw = cw, dh = ch;
      if (imgAspect > canvasAspect) dw = ch * imgAspect;
      else dh = cw / imgAspect;

      ctx.save();
      ctx.translate(cw / 2 + panX, ch / 2 + panY);
      ctx.scale(zoomFactor, zoomFactor);
      ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
      ctx.restore();

      // 2. Vignette overlay
      const grad = ctx.createRadialGradient(cw / 2, ch / 2, Math.min(cw, ch) * 0.3, cw / 2, ch / 2, Math.max(cw, ch) * 0.7);
      if (st === "Cyberpunk") { grad.addColorStop(0, "rgba(26,0,48,0.05)"); grad.addColorStop(1, "rgba(10,0,20,0.65)"); }
      else if (st === "Disney" || st === "Fantasy") { grad.addColorStop(0, "rgba(255,230,250,0.05)"); grad.addColorStop(1, "rgba(15,5,25,0.55)"); }
      else { grad.addColorStop(0, "rgba(0,0,0,0)"); grad.addColorStop(1, "rgba(0,0,0,0.6)"); }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, cw, ch);

      // 3. Particles — NO shadowBlur for performance
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;

        if (st === "Realistic") {
          ctx.beginPath();
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.size;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.vx * 3, p.y + p.vy * 3);
          ctx.stroke();
        } else if (st === "Minecraft") {
          ctx.fillRect(p.x, p.y, p.size, p.size);
        } else if (st === "Free Fire") {
          ctx.beginPath();
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.size;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 2.0, p.y - p.vy * 2.0);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        if (playing) {
          p.x += p.vx;
          p.y += p.vy;
          if (st === "Disney" || st === "Fantasy") {
            if (p.sinVal !== undefined && p.sinSpeed !== undefined) {
              p.sinVal += p.sinSpeed;
              p.x += Math.sin(p.sinVal) * 0.4;
            }
          }
          if (p.y > ch + 20 || p.y < -20 || p.x > cw + 20 || p.x < -20) {
            particles[i] = createParticle(cw, ch, st, false);
          }
        }
      }

      // 4. Lens flare sweep (lightweight)
      if (playing) {
        ctx.save();
        const flareX = (ct / dur) * (cw * 1.5) - cw * 0.25;
        const fg = ctx.createRadialGradient(flareX, ch * 0.3, 0, flareX, ch * 0.3, 120);
        fg.addColorStop(0, st === "Cyberpunk" ? "rgba(0,240,255,0.12)" : "rgba(255,245,230,0.12)");
        fg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = fg;
        ctx.fillRect(0, 0, cw, ch);
        ctx.restore();
      }

      animFrame = requestAnimationFrame(render);
    };

    animFrame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [imageLoaded]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentTime(0);
    setProgress(0);
    setIsPlaying(true);
  };

  const formatTime = (timeInSecs: number) => {
    const min = Math.floor(timeInSecs / 60);
    const sec = Math.floor(timeInSecs % 60);
    const ms = Math.floor((timeInSecs % 1) * 100);
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  // Determine container aspect classes
  const isPortrait = aspectRatio === "9:16";
  const aspectClass = isPortrait 
    ? "aspect-[9/16] w-full max-w-[340px] mx-auto rounded-3xl" 
    : "aspect-[16/9] w-full rounded-2xl";

  return (
    <div className="w-full flex flex-col items-center select-none" id="cinematic-player">
      {/* Player Frame */}
      <div 
        ref={containerRef}
        className={`relative ${aspectClass} overflow-hidden shadow-2xl bg-zinc-950 border border-zinc-800/80 group`}
      >
        {!imageLoaded ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-zinc-950/90 text-zinc-400">
            <div className="relative flex items-center justify-center">
              <div className="w-12 h-12 border-2 border-indigo-500/20 border-t-indigo-400 rounded-full animate-spin"></div>
              <Sparkles className="w-5 h-5 text-indigo-400 absolute animate-pulse" />
            </div>
            <p className="text-xs font-mono tracking-widest text-zinc-500 uppercase">
              Rendering Cinematic Canvas...
            </p>
          </div>
        ) : (
          <canvas ref={canvasRef} className="w-full h-full block cursor-pointer" onClick={handlePlayPause} />
        )}

        {/* Cinematic Watermark Overlay */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between bg-black/65 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] uppercase tracking-wider font-mono text-zinc-350">
              {scenes ? `Film Menyatu • Adegan ${currentSceneIdx + 1}/${scenes.length}` : `${style} Cinematic Mode`}
            </span>
          </div>
          {scenes && (
            <span className="text-[9px] font-bold text-emerald-400 font-mono bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20 max-w-[200px] truncate">
              {activeTitle}
            </span>
          )}
        </div>

        {/* Big Play Pause Center Hover Overlay */}
        {imageLoaded && !isPlaying && (
          <div 
            onClick={handlePlayPause}
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center cursor-pointer transition-all duration-300"
          >
            <div className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md flex items-center justify-center transition-all shadow-lg hover:scale-105 border border-white/20">
              <Play className="w-7 h-7 fill-current ml-1" />
            </div>
          </div>
        )}

        {/* Video Controls overlay on hover */}
        {imageLoaded && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/95 via-black/50 to-transparent opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
            {/* Timeline Progress Bar */}
            <div className="w-full h-1 bg-zinc-700/60 rounded-full mb-3 cursor-pointer relative overflow-hidden" 
                 onClick={(e) => {
                   const rect = e.currentTarget.getBoundingClientRect();
                   const clickPercent = (e.clientX - rect.left) / rect.width;
                   setCurrentTime(clickPercent * duration);
                 }}>
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md scale-0 group-hover:scale-100 transition-transform"></div>
              </div>
            </div>

            {/* Bottom Controls strip */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button 
                  onClick={handlePlayPause}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                </button>
                <button 
                  onClick={() => {
                    setCurrentSceneIdx(0);
                    handleReset();
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition"
                  title="Mulai Ulang Film"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Ambient Audio controller */}
                <div className="flex items-center space-x-1.5 border-r border-zinc-800 pr-3 mr-1">
                  <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition"
                    title={isMuted ? "Aktifkan Musik Latar" : "Bungkam Musik Latar"}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <span className="text-[10px] font-mono text-zinc-400 hidden sm:inline">
                    Ambient Audio
                  </span>
                </div>

                {/* Scene manual skipper (chevron buttons) */}
                {scenes && (
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      disabled={currentSceneIdx === 0}
                      onClick={() => {
                        if (currentSceneIdx > 0) {
                          setCurrentSceneIdx(currentSceneIdx - 1);
                          setCurrentTime(0);
                        }
                      }}
                      className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition disabled:opacity-20"
                      title="Adegan Sebelumnya"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-[10px] font-mono text-zinc-300">
                      Adegan {currentSceneIdx + 1}/{scenes.length}
                    </span>
                    <button
                      type="button"
                      disabled={currentSceneIdx === scenes.length - 1}
                      onClick={() => {
                        if (currentSceneIdx < scenes.length - 1) {
                          setCurrentSceneIdx(currentSceneIdx + 1);
                          setCurrentTime(0);
                        }
                      }}
                      className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition disabled:opacity-20"
                      title="Adegan Berikutnya"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Time displays */}
              <div className="text-right text-[11px] font-mono text-zinc-300 space-x-1">
                <span>{formatTime(currentTime)}</span>
                <span className="text-zinc-500">/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Description below player */}
      <div className="mt-3 w-full bg-zinc-900/60 border border-zinc-800/80 px-4 py-3 rounded-xl flex items-start gap-2.5 text-xs text-zinc-450 shadow-inner">
        <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
        <div className="flex-1 min-w-0">
          <span className="font-bold text-zinc-300 uppercase tracking-wider text-[10px] block mb-0.5 font-mono">
            {scenes ? `Deskripsi Adegan ${currentSceneIdx + 1}: ${activeTitle}` : "Deskripsi Visual"}
          </span>
          <p className="italic text-zinc-305 leading-relaxed">
            "{activePrompt}"
          </p>
        </div>
      </div>
    </div>
  );
}
