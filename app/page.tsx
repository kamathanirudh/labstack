"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Rocket } from "lucide-react";
import { createLab } from "@/lib/api";
import { useRouter } from "next/navigation";
import React from "react";

const LAB_OPTIONS = [
  { id: "python-lab" as const, title: "Python Lab 🐍", description: "Write Python code in browser-based VS Code" },
  { id: "linux-networking-lab" as const, title: "Linux + Networking Lab 🐧🌐", description: "Run Linux tools, networking utilities, and terminal commands in-browser." },
  { id: "python-cli-lab" as const, title: "Python CLI Lab 🐍💻", description: "Minimal Python REPLs in browser terminal" },
  { id: "sql-lab" as const, title: "SQL Lab 🧮", description: "Use the SQLite CLI in your browser to write and query SQL" },
];
const TTL_OPTIONS = [
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 60, label: "60 minutes" },
  { value: 90, label: "90 minutes" },
  { value: 120, label: "120 minutes" },
];

export default function LabStack() {
  const router = useRouter();
  const [selectedLab, setSelectedLab] = useState<string | null>(null);
  const [selectedTTL, setSelectedTTL] = useState<number>(30);
  const [isLaunching, setIsLaunching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [loadingText, setLoadingText] = useState("Launching Lab...");
  const [easterEgg, setEasterEgg] = useState(false);
  const confettiRef = useRef<HTMLDivElement>(null);

  // Fun loading/celebration states
  useEffect(() => {
    if (isLaunching) {
      const loadingVariants = [
        "Spinning up your cloud lab...",
        "Allocating CPUs to your project...",
        "Waking up the servers...",
        "Almost there...",
        "Quantum entangling your containers...",
      ];
      let i = 0;
      const interval = setInterval(() => {
        setLoadingText(loadingVariants[i % loadingVariants.length]);
        i++;
      }, 1800);
      return () => clearInterval(interval);
    } else {
      setLoadingText("Launching Lab...");
    }
  }, [isLaunching]);

  // --- Cursor Trail Effect ---
  useEffect(() => {
    type TrailDot = { el: HTMLDivElement; x: number; y: number };
    const trail: TrailDot[] = [];
    const maxTrail = 18;
    let mouseMoveHandler: ((e: MouseEvent) => void) | undefined;
    let raf: number | undefined;
    if (typeof window !== 'undefined') {
      const root = document.body;
      for (let i = 0; i < maxTrail; i++) {
        const dot = document.createElement('div');
        dot.className = 'cursor-trail-dot';
        root.appendChild(dot);
        trail.push({ el: dot, x: 0, y: 0 });
      }
      let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      mouseMoveHandler = (e: MouseEvent) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      };
      window.addEventListener('mousemove', mouseMoveHandler);
      function animate() {
        let x = mouse.x, y = mouse.y;
        for (let i = 0; i < trail.length; i++) {
          const dot = trail[i];
          dot.x += (x - dot.x) * 0.25;
          dot.y += (y - dot.y) * 0.25;
          dot.el.style.transform = `translate3d(${dot.x - 8}px,${dot.y - 8}px,0)`;
          dot.el.style.opacity = `${1 - i / maxTrail}`;
          x = dot.x;
          y = dot.y;
        }
        raf = requestAnimationFrame(animate);
      }
      animate();
      return () => {
        if (mouseMoveHandler) window.removeEventListener('mousemove', mouseMoveHandler);
        trail.forEach(dot => dot.el.remove());
        if (raf) cancelAnimationFrame(raf);
      };
    }
  }, []);

  // --- Sound Design (placeholder for future use) ---
  // Example: play a sound on button click (not implemented, just a hook)
  // const playSound = (type: 'launch' | 'hover') => { /* ... */ };

  const handleLaunchLab = async () => {
    if (!selectedLab) return;
    setIsLaunching(true);
    setError(null);
    try {
      const labId = await createLab(selectedLab, selectedTTL);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2200);
      router.push(`/lab/${labId}?ttl=${selectedTTL}`);
    } catch (err) {
      setError("Failed to launch lab. Please try again.");
    } finally {
      setIsLaunching(false);
    }
  };

  // Easter egg: Press 'L' + 'S' or click LabStack title 5x
  useEffect(() => {
    let count = 0;
    const handler = (e: KeyboardEvent) => {
      if ((e.key === 'l' || e.key === 'L') && (e.ctrlKey || e.metaKey)) setEasterEgg(true);
    };
    const title = document.getElementById('labstack-title');
    const clicker = () => {
      count++;
      if (count >= 5) setEasterEgg(true);
      setTimeout(() => { count = 0; }, 2000);
    };
    window.addEventListener('keydown', handler);
    if (title) title.addEventListener('click', clicker);
    return () => {
      window.removeEventListener('keydown', handler);
      if (title) title.removeEventListener('click', clicker);
    };
  }, []);

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Confetti celebration */}
      {showConfetti && <LabConfettiOverlay ref={confettiRef} />}
      {/* Parallax Background Layers */}
      <div className="absolute inset-0 -z-10 bg-[#111216]" />
      {/* Ambient Lighting Overlay */}
      <div className="ambient-light absolute inset-0 pointer-events-none -z-5" aria-hidden />
      {/* Particle Effect Placeholder */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* TODO: Replace with react-tsparticles or canvas particles */}
        <div className="w-full h-full" id="particle-bg" />
      </div>
      {/* Header */}
      <header className="w-full flex flex-col items-center justify-center px-10 pt-10 pb-4 bg-transparent">
        <h1 id="labstack-title" className="text-7xl md:text-8xl lg:text-9xl orbitron-heading text-white text-center select-none cursor-pointer" style={{letterSpacing: 1}}>
          LabStack
        </h1>
      </header>
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center w-full px-4 pb-24">
        <div className="w-full max-w-6xl space-y-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 text-white font-poppins">Spin up a Cloud Lab</h2>
            <p className="text-[#bfc9ff] text-lg font-inter">Choose your environment and get started in seconds.</p>
          </div>
          {/* Asymmetrical Premium Grid Layout */}
          <div className="premium-grid mt-8">
            {LAB_OPTIONS.map((lab, i) => (
              <div
                key={lab.id}
                className={`relative group transition-all duration-300 cursor-pointer rounded-3xl border-0 shadow-2xl bg-white/10 backdrop-blur-lg overflow-hidden
                  ${selectedLab === lab.id ? "ring-4 ring-[#6366f1]/80" : "ring-2 ring-[#232946]/40"}
                  hover:scale-105 hover:shadow-[0_8px_32px_0_rgba(99,102,241,0.4)]
                  premium-grid-card premium-grid-card-${i}
                `}
                style={{ minHeight: 180, boxShadow: selectedLab === lab.id ? "0 0 32px 8px #6366f1aa" : undefined, zIndex: 1 }}
                onClick={() => setSelectedLab(lab.id)}
              >
                {/* Animated Gradient Border */}
                <div className="absolute inset-0 z-0 pointer-events-none rounded-3xl border-4 border-transparent group-hover:border-gradient animate-border-gradient" />
                {/* Glow */}
                <div className="absolute -inset-2 z-0 rounded-3xl opacity-0 group-hover:opacity-60 transition-all duration-300 blur-2xl bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#06b6d4]" />
                {/* Card Content */}
                <Card className="bg-transparent shadow-none border-0 h-full relative z-10">
                  <CardContent className="p-6 flex flex-col justify-center h-full">
                    <h3 className="text-xl font-bold mb-1 text-white font-poppins">{lab.title}</h3>
                    <p className="text-[#bfc9ff] text-base font-inter">{lab.description}</p>
                  </CardContent>
                </Card>
                {/* Interactive Preview on Hover */}
                {/* Remove MatrixRainPreview from button overlays, keep only for card previews if needed */}
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4 mt-8">
            <label className="text-lg font-semibold text-white">Time to Live:</label>
            <Select value={selectedTTL.toString()} onValueChange={(value) => setSelectedTTL(Number(value))}>
              <SelectTrigger className="w-48 bg-white/10 border-0 text-white shadow-md rounded-xl focus:ring-2 focus:ring-[#6366f1] backdrop-blur-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#232946] border-0 rounded-xl shadow-lg">
                {TTL_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()} className="hover:bg-[#6366f1]/20">{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleLaunchLab}
            disabled={!selectedLab || isLaunching}
            className="w-full h-16 text-xl font-bold rounded-2xl bg-[#e5e7eb] text-[#111216] mt-8 simple-launch-btn"
            style={{ letterSpacing: 1 }}
          >
            {isLaunching ? (
              <>
                <span className="loader mr-3" />
                {loadingText}
              </>
            ) : (
              <>
                <Rocket className="mr-3 h-6 w-6" />
                Launch Lab
              </>
            )}
          </Button>
          {error && <div className="text-red-400 text-center mt-4">{error}</div>}
        </div>
      </main>
      {/* Easter Egg Modal */}
      {easterEgg && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80" onClick={() => setEasterEgg(false)}>
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-10 border-2 border-[#6366f1] shadow-2xl text-center max-w-lg mx-auto">
            <h2 className="text-4xl font-extrabold mb-4 gradient-text">👾 Secret Unlocked!</h2>
            <p className="text-lg text-white mb-4">You found an easter egg!<br/>Keep exploring for more surprises.</p>
            <button className="mt-4 px-6 py-2 rounded-xl bg-[#6366f1] text-white font-bold text-lg shadow-lg hover:bg-[#8b5cf6] transition" onClick={() => setEasterEgg(false)}>Close</button>
          </div>
        </div>
      )}
      {/* Footer */}
      <footer className="w-full py-8 px-10 flex flex-col md:flex-row justify-between items-center bg-transparent text-white/60 text-sm gap-4">
        <div>© {new Date().getFullYear()} LabStack. All rights reserved.</div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition">Twitter</a>
          <a href="#" className="hover:text-white transition">GitHub</a>
          <a href="#" className="hover:text-white transition">Contact</a>
        </div>
      </footer>
      <style jsx global>{`
        html { font-family: 'Inter', 'Poppins', 'Segoe UI', Arial, sans-serif; }
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@900&display=swap');
        .font-poppins { font-family: 'Poppins', 'Inter', 'Segoe UI', Arial, sans-serif; }
        .font-inter { font-family: 'Inter', 'Poppins', 'Segoe UI', Arial, sans-serif; }
        .orbitron-heading {
          font-family: "Orbitron", sans-serif;
          font-optical-sizing: auto;
          font-weight: 900;
          font-style: normal;
        }
        .simple-launch-btn {
          background: #e5e7eb !important;
          color: #111216 !important;
          box-shadow: none !important;
          border: none !important;
          transition: background 0.2s, color 0.2s;
        }
        .simple-launch-btn:hover:not(:disabled), .simple-launch-btn:focus-visible:not(:disabled) {
          background: #f3f4f6 !important;
          color: #111216 !important;
        }
        .simple-launch-btn:active:not(:disabled) {
          background: #d1d5db !important;
        }
        .gradient-text {
          background: linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4, #fff 80%);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 2px 16px #6366f1cc);
          animation: gradientTextMove 6s ease-in-out infinite alternate;
        }
        @keyframes gradientTextMove {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        .glitch-title {
          position: relative;
          display: inline-block;
        }
        .glitch {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          opacity: 0.5;
          pointer-events: none;
          animation: glitchAnim 2.5s infinite linear alternate-reverse;
        }
        .glitch:nth-child(2) {
          left: 2px; text-shadow: -2px 0 #06b6d4, 2px 2px #8b5cf6;
          animation-delay: 0.15s;
        }
        .glitch:nth-child(3) {
          left: -2px; text-shadow: 2px 0 #6366f1, -2px -2px #fff;
          animation-delay: 0.3s;
        }
        @keyframes glitchAnim {
          0% { transform: translate(0,0) skew(0deg); opacity: 0.5; }
          10% { transform: translate(-2px,2px) skew(-1deg); opacity: 0.7; }
          20% { transform: translate(2px,-1px) skew(1deg); opacity: 0.6; }
          30% { transform: translate(-1px,1px) skew(-2deg); opacity: 0.8; }
          40% { transform: translate(1px,-2px) skew(2deg); opacity: 0.5; }
          50% { transform: translate(-2px,2px) skew(-1deg); opacity: 0.7; }
          60% { transform: translate(2px,-1px) skew(1deg); opacity: 0.6; }
          70% { transform: translate(-1px,1px) skew(-2deg); opacity: 0.8; }
          80% { transform: translate(1px,-2px) skew(2deg); opacity: 0.5; }
          100% { transform: translate(0,0) skew(0deg); opacity: 0.5; }
        }
        /* Asymmetrical Premium Grid Layout */
        .premium-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          grid-auto-rows: 220px;
          gap: 2.5rem;
        }
        .premium-grid-card-0 { grid-column: 1 / span 7; grid-row: 1; }
        .premium-grid-card-1 { grid-column: 8 / span 5; grid-row: 1; }
        .premium-grid-card-2 { grid-column: 2 / span 5; grid-row: 2; }
        .premium-grid-card-3 { grid-column: 7 / span 6; grid-row: 2; }
        .animate-gradient {
          background: linear-gradient(270deg, #232946, #1a1446, #0a0a23, #232946);
          background-size: 600% 600%;
          animation: gradientBG 16s ease infinite;
        }
        @keyframes gradientBG {
          0% {background-position:0% 50%}
          50% {background-position:100% 50%}
          100% {background-position:0% 50%}
        }
        .border-gradient { border-image: linear-gradient(120deg, #6366f1, #8b5cf6, #06b6d4) 1; }
        .animate-border-gradient { animation: borderGradientMove 3s linear infinite; }
        @keyframes borderGradientMove { 0% { border-image-source: linear-gradient(120deg, #6366f1, #8b5cf6, #06b6d4); } 100% { border-image-source: linear-gradient(420deg, #6366f1, #8b5cf6, #06b6d4); } }
        /* Launch Lab Button Pulse, Gradient, and Particle Burst */
        /* Loader/Progress Indicator */
        .loader {
          display: inline-block;
          width: 1.5rem;
          height: 1.5rem;
          border: 3px solid #fff;
          border-radius: 50%;
          border-top: 3px solid #6366f1;
          animation: spin 0.8s linear infinite;
          vertical-align: middle;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        /* Parallax background layers */
        .parallax-bg {
          background: radial-gradient(ellipse at 20% 30%, #6366f1 0%, transparent 60%),
                      radial-gradient(ellipse at 80% 70%, #06b6d4 0%, transparent 70%),
                      radial-gradient(ellipse at 50% 100%, #8b5cf6 0%, transparent 80%);
          background-size: cover;
          background-repeat: no-repeat;
          will-change: background-position;
          animation: parallaxMove 24s linear infinite alternate;
        }
        @keyframes parallaxMove {
          0% { background-position: 0% 0%, 100% 100%, 50% 100%; }
          100% { background-position: 20% 10%, 80% 90%, 60% 110%; }
        }
        /* Ambient lighting overlay */
        .ambient-light {
          background: radial-gradient(circle at 60% 40%, #fff8 0%, transparent 70%),
                      radial-gradient(circle at 20% 80%, #6366f144 0%, transparent 80%);
          mix-blend-mode: lighten;
          opacity: 0.25;
          pointer-events: none;
        }
        /* Cursor trail effect */
        .cursor-trail-dot {
          position: fixed;
          width: 16px; height: 16px;
          border-radius: 50%;
          background: linear-gradient(120deg, #6366f1, #8b5cf6, #06b6d4);
          pointer-events: none;
          z-index: 9999;
          filter: blur(2px) brightness(1.2);
          transition: background 0.3s;
          will-change: transform, opacity;
        }
        /* Stat Card Styles */
        .stat-card {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 15px;
          padding: 1.5rem 2rem;
          text-align: center;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
        }
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 48px rgba(0, 0, 0, 0.3);
        }
        .stat-label {
          font-size: 1.1rem;
          color: #bfc9ff;
          margin-bottom: 0.5rem;
          display: block;
        }
        .stat-value {
          font-size: 2.5rem;
          font-weight: 700;
          color: #fff;
          display: block;
        }
        .animate-number {
          display: inline-block;
          opacity: 0;
          transform: translateY(20px);
          animation: fadeInUp 0.8s forwards ease-out;
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function MatrixRainPreview() {
  // Simple animated matrix rain effect using CSS
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="matrix-rain w-4/5 h-32 max-w-xs mx-auto text-[#39FF14] font-mono text-lg overflow-hidden relative">
        {Array.from({ length: 16 }).map((_, i) => (
          <span key={i} className={`matrix-col animate-matrixRain delay-${i % 8}`}>{randomMatrixString(8)}</span>
        ))}
      </div>
      <style jsx>{`
        .matrix-rain {
          display: flex;
          flex-direction: row;
          gap: 2px;
        }
        .matrix-col {
          display: block;
          white-space: pre;
          opacity: 0.7;
          animation: matrixRain 1.2s linear infinite;
        }
        .animate-matrixRain {
          animation: matrixRain 1.2s linear infinite;
        }
        .delay-0 { animation-delay: 0s; }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        .delay-4 { animation-delay: 0.4s; }
        .delay-5 { animation-delay: 0.5s; }
        .delay-6 { animation-delay: 0.6s; }
        .delay-7 { animation-delay: 0.7s; }
        @keyframes matrixRain {
          0% { opacity: 0.2; transform: translateY(-40%); }
          50% { opacity: 1; transform: translateY(0%); }
          100% { opacity: 0.2; transform: translateY(40%); }
        }
      `}</style>
    </div>
  );
}

function randomMatrixString(length: number) {
  const chars = "01ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let str = "";
  for (let i = 0; i < length; i++) {
    str += chars[Math.floor(Math.random() * chars.length)];
  }
  return str;
}

const LabConfettiOverlay = React.forwardRef<HTMLDivElement, {}>(function LabConfettiOverlay(_props, ref) {
  // Simple confetti burst using CSS
  return (
    <div ref={ref} className="pointer-events-none fixed inset-0 z-[9999]">
      {Array.from({ length: 42 }).map((_, i) => (
        <span key={i} className={`confetti confetti-${i}`} />
      ))}
      <style jsx>{`
        .confetti {
          position: absolute;
          width: 12px; height: 24px;
          border-radius: 4px;
          opacity: 0.85;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%) scale(1);
          background: linear-gradient(120deg, #6366f1, #8b5cf6, #06b6d4, #fff 80%);
          animation: confetti-burst 1.8s cubic-bezier(.4,0,.2,1) forwards;
        }
        ${Array.from({ length: 42 }).map((_, i) => `.confetti-${i} { animation-delay: ${(i * 0.03).toFixed(2)}s; left: ${50 + Math.sin(i) * 30}%; top: ${50 + Math.cos(i) * 18}%; }`).join("\n")}
        @keyframes confetti-burst {
          0% { opacity: 1; transform: translate(-50%, -50%) scale(1) rotate(0deg); }
          80% { opacity: 1; }
          100% { opacity: 0; transform: translate(-50%, -120vh) scale(0.7) rotate(360deg); }
        }
      `}</style>
    </div>
  );
});
