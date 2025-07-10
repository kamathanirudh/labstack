'use client';

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { getLabStatus } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, ExternalLink } from "lucide-react";

interface ActiveLab {
  id: string;
  url: string;
  remainingTime: number;
}

export default function LabPage({ params }: { params: { labId: string } }) {
  const { labId } = params;
  const searchParams = useSearchParams();
  const ttl = Number(searchParams.get("ttl")) || 15;
  const [status, setStatus] = useState<string | null>(null);
  const [activeLab, setActiveLab] = useState<ActiveLab | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Minimal state only
  const [showConfetti, setShowConfetti] = useState(false);
  const [loadingText, setLoadingText] = useState("Launching your lab...");
  const [easterEgg, setEasterEgg] = useState(false);
  const confettiRef = useRef<HTMLDivElement>(null);

  // Fun loading/celebration states
  useEffect(() => {
    if (status !== "ready" && !error) {
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
      setLoadingText("Launching your lab...");
    }
  }, [status, error]);

  // Confetti on successful launch (show when lab becomes ready)
  useEffect(() => {
    if (status === "ready") {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2200);
    }
  }, [status]);

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

  // Cursor Trail Effect
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

  // Sound Design (placeholder for future use)
  // const playSound = (type: 'launch' | 'hover') => { /* ... */ };

  useEffect(() => {
    let poll: NodeJS.Timeout;
    const fetchStatus = async () => {
      try {
        const res = await getLabStatus(labId);
        setStatus(res.status);
        if (res.status === "error") {
          setError("Failed to launch the lab. Please try again.");
          clearInterval(poll);
        } else if (res.status === "ready" && res.access_url) {
          setError(null);
          setActiveLab({
            id: labId,
            url: res.access_url,
            remainingTime: ttl * 60,
          });
          clearInterval(poll);
        }
      } catch (e) {
        setError("Unable to connect to backend. Please check your connection and try again.");
        clearInterval(poll);
      }
    };
    fetchStatus();
    poll = setInterval(fetchStatus, 5000);
    return () => clearInterval(poll);
  }, [labId, ttl]);

  useEffect(() => {
    if (activeLab && status === "ready") {
      const interval = setInterval(() => {
        setActiveLab((prev) => {
          if (!prev) return null;
          const newRemaining = prev.remainingTime - 1;
          if (newRemaining <= 0) return { ...prev, remainingTime: 0 };
          return { ...prev, remainingTime: newRemaining };
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeLab, status]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCopy = async () => {
    if (activeLab?.url) {
      await navigator.clipboard.writeText(activeLab.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  // Animated gradient background, parallax, ambient light, particles
  const Background = () => (
    <>
      {showConfetti && <ConfettiOverlay ref={confettiRef} />}
      <div className="absolute inset-0 -z-10 bg-[#111216]" />
      <div className="ambient-light absolute inset-0 pointer-events-none -z-5" aria-hidden />
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* TODO: Replace with react-tsparticles or canvas particles */}
        <div className="w-full h-full" id="particle-bg" />
      </div>
    </>
  );

  // Header/Footer
  const Header = () => (
    <header className="w-full flex flex-col items-center justify-center px-10 pt-10 pb-4 bg-transparent">
      <h1 id="labstack-title" className="text-7xl md:text-8xl lg:text-9xl orbitron-heading text-white text-center select-none cursor-pointer" style={{letterSpacing: 1}}>
        LabStack
      </h1>
    </header>
  );
  const Footer = () => (
    <footer className="w-full py-8 px-10 flex flex-col md:flex-row justify-between items-center bg-transparent text-white/60 text-sm gap-4">
      <div>© {new Date().getFullYear()} LabStack. All rights reserved.</div>
      <div className="flex gap-6">
        <a href="#" className="hover:text-white transition">Twitter</a>
        <a href="#" className="hover:text-white transition">GitHub</a>
        <a href="#" className="hover:text-white transition">Contact</a>
      </div>
    </footer>
  );

  if (error) {
    return (
      <div className="min-h-screen w-full relative overflow-hidden">
        <Background />
        <Header />
        <div className="flex flex-col items-center justify-center h-[70vh] text-center">
          <h2 className="text-5xl md:text-6xl font-extrabold mb-4 text-white text-center" style={{letterSpacing: 1}}>Error</h2>
          <p className="mb-6 text-lg text-white">{error}</p>
          <Button onClick={() => window.location.reload()} className="mb-2 rounded-xl text-lg px-8 py-3 bg-[#e5e7eb] text-[#111216] minimal-btn">Retry</Button>
          <Button variant="outline" onClick={() => window.location.href = '/'} className="rounded-xl text-lg px-8 py-3 border-[#6366f1] text-[#6366f1]">Go Back</Button>
        </div>
        <Footer />
        <style jsx global>{`
          html { font-family: 'Inter', 'Poppins', 'Segoe UI', Arial, sans-serif; }
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
          .glitch-title {
            position: relative;
            display: inline-block;
          }
          .glitch-title span {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            color: transparent;
            -webkit-text-stroke: 1px #6366f1;
            -webkit-text-fill-color: transparent;
          }
          .glitch-title .gradient-text {
            background: linear-gradient(to right, #6366f1, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .parallax-bg {
            background-image: url('/assets/bg-pattern.svg');
            background-size: 1000px 1000px;
            background-position: center;
            background-repeat: repeat;
            opacity: 0.05;
            pointer-events: none;
          }
          .ambient-light {
            background: radial-gradient(circle, rgba(26, 20, 70, 0.1) 0%, rgba(10, 10, 35, 0) 70%);
            pointer-events: none;
          }
          .cursor-trail-dot {
            position: fixed;
            width: 16px;
            height: 16px;
            background-color: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            pointer-events: none;
            z-index: 99999;
          }
          .stat-card {
            background: rgba(26, 20, 70, 0.5);
            border: 1px solid rgba(99, 102, 241, 0.2);
            border-radius: 15px;
            padding: 15px 25px;
            text-align: center;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
          }
          .stat-card:hover {
            background: rgba(26, 20, 70, 0.7);
            border-color: rgba(99, 102, 241, 0.4);
          }
          .stat-label {
            display: block;
            font-size: 0.875rem;
            color: #bfc9ff;
            margin-bottom: 5px;
          }
          .stat-value {
            font-size: 2.5rem;
            font-weight: 700;
            color: #6366f1;
            font-family: 'Inter', sans-serif;
          }
          .animate-number {
            display: inline-block;
            opacity: 0;
            transform: translateY(10px);
            animation: fadeInUp 0.8s ease-out forwards;
          }
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .confetti-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 99999;
          }
          @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@900&display=swap');
          .orbitron-heading {
            font-family: "Orbitron", sans-serif;
            font-optical-sizing: auto;
            font-weight: 900;
            font-style: normal;
          }
          .minimal-btn {
            background: #e5e7eb !important;
            color: #111216 !important;
            box-shadow: none !important;
            border: none !important;
            transition: background 0.2s, color 0.2s;
          }
          .minimal-btn:hover:not(:disabled), .minimal-btn:focus-visible:not(:disabled) {
            background: #f3f4f6 !important;
            color: #111216 !important;
          }
          .minimal-btn:active:not(:disabled) {
            background: #d1d5db !important;
          }
        `}</style>
      </div>
    );
  }

  if (!activeLab || status !== "ready") {
    return (
      <div className="min-h-screen w-full relative overflow-hidden">
        <Background />
        <Header />
        <div className="flex flex-col items-center justify-center h-[70vh] text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-[#6366f1] mb-10 shadow-xl" />
          <h2 className="text-5xl md:text-6xl font-extrabold mb-2 text-white text-center" style={{letterSpacing: 1}}>{loadingText}</h2>
          <p className="text-[#bfc9ff] text-lg">Please wait while we set up your environment.</p>
        </div>
        <Footer />
        <style jsx global>{`
          html { font-family: 'Inter', 'Poppins', 'Segoe UI', Arial, sans-serif; }
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
          .glitch-title {
            position: relative;
            display: inline-block;
          }
          .glitch-title span {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            color: transparent;
            -webkit-text-stroke: 1px #6366f1;
            -webkit-text-fill-color: transparent;
          }
          .glitch-title .gradient-text {
            background: linear-gradient(to right, #6366f1, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .parallax-bg {
            background-image: url('/assets/bg-pattern.svg');
            background-size: 1000px 1000px;
            background-position: center;
            background-repeat: repeat;
            opacity: 0.05;
            pointer-events: none;
          }
          .ambient-light {
            background: radial-gradient(circle, rgba(26, 20, 70, 0.1) 0%, rgba(10, 10, 35, 0) 70%);
            pointer-events: none;
          }
          .cursor-trail-dot {
            position: fixed;
            width: 16px;
            height: 16px;
            background-color: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            pointer-events: none;
            z-index: 99999;
          }
          .stat-card {
            background: rgba(26, 20, 70, 0.5);
            border: 1px solid rgba(99, 102, 241, 0.2);
            border-radius: 15px;
            padding: 15px 25px;
            text-align: center;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
          }
          .stat-card:hover {
            background: rgba(26, 20, 70, 0.7);
            border-color: rgba(99, 102, 241, 0.4);
          }
          .stat-label {
            display: block;
            font-size: 0.875rem;
            color: #bfc9ff;
            margin-bottom: 5px;
          }
          .stat-value {
            font-size: 2.5rem;
            font-weight: 700;
            color: #6366f1;
            font-family: 'Inter', sans-serif;
          }
          .animate-number {
            display: inline-block;
            opacity: 0;
            transform: translateY(10px);
            animation: fadeInUp 0.8s ease-out forwards;
          }
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .confetti-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 99999;
          }
        `}</style>
      </div>
    );
  }

  // === Render Active Lab Mode UI ===
  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      <Background />
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center w-full px-4 pb-24">
        <Card className="w-full max-w-xl shadow-2xl border-0 bg-white/10 backdrop-blur-lg rounded-3xl">
          <CardContent className="p-10 flex flex-col items-center">
            <h1 className="text-6xl md:text-7xl orbitron-heading font-extrabold mb-4 text-white tracking-tight text-center" style={{letterSpacing: 1}}>Your Lab is Ready 🎉</h1>
            <p className="text-[#bfc9ff] mb-6 text-lg">Auto-deletes after TTL expires</p>
            <div className="bg-[#1a1446]/80 rounded-xl p-5 w-full flex flex-col items-center mb-6 shadow-md">
              <span className="text-base text-[#bfc9ff] mb-2">Access your lab:</span>
              <div className="flex w-full gap-2 items-center">
                <input
                  type="text"
                  readOnly
                  value={activeLab.url}
                  className="w-full border-0 px-3 py-2 text-lg rounded-lg bg-[#232946] text-[#6366f1] font-mono shadow-inner focus:outline-none"
                />
                <Button size="lg" onClick={handleCopy} className="rounded-xl text-lg px-8 py-3 bg-[#e5e7eb] text-[#111216] minimal-btn">
                  <Copy className="h-5 w-5" />
                  {copied && <span className="ml-2 text-xs text-[#6366f1]">Copied!</span>}
                </Button>
                <Button size="lg" onClick={() => window.open(activeLab.url, "_blank")}
                  className="rounded-xl text-lg px-8 py-3 bg-[#e5e7eb] text-[#111216] minimal-btn">
                  <ExternalLink className="h-5 w-5 mr-2" />Open Lab
                </Button>
              </div>
            </div>
            <div className="flex flex-col items-center w-full">
              <div className="text-7xl font-extrabold text-[#6366f1] mb-2 tracking-wide text-center">
                {formatTime(activeLab.remainingTime)}
              </div>
              <span className="text-[#bfc9ff] text-lg">Time remaining</span>
            </div>
          </CardContent>
        </Card>
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
      <Footer />
      <style jsx global>{`
        html { font-family: 'Inter', 'Poppins', 'Segoe UI', Arial, sans-serif; }
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
        .glitch-title {
          position: relative;
          display: inline-block;
        }
        .glitch-title span {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          color: transparent;
          -webkit-text-stroke: 1px #6366f1;
          -webkit-text-fill-color: transparent;
        }
        .glitch-title .gradient-text {
          background: linear-gradient(to right, #6366f1, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .parallax-bg {
          background-image: url('/assets/bg-pattern.svg');
          background-size: 1000px 1000px;
          background-position: center;
          background-repeat: repeat;
          opacity: 0.05;
          pointer-events: none;
        }
        .ambient-light {
          background: radial-gradient(circle, rgba(26, 20, 70, 0.1) 0%, rgba(10, 10, 35, 0) 70%);
          pointer-events: none;
        }
        .cursor-trail-dot {
          position: fixed;
          width: 16px;
          height: 16px;
          background-color: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          pointer-events: none;
          z-index: 99999;
        }
        .stat-card {
          background: rgba(26, 20, 70, 0.5);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 15px;
          padding: 15px 25px;
          text-align: center;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        .stat-card:hover {
          background: rgba(26, 20, 70, 0.7);
          border-color: rgba(99, 102, 241, 0.4);
        }
        .stat-label {
          display: block;
          font-size: 0.875rem;
          color: #bfc9ff;
          margin-bottom: 5px;
        }
        .stat-value {
          font-size: 2.5rem;
          font-weight: 700;
          color: #6366f1;
          font-family: 'Inter', sans-serif;
        }
        .animate-number {
          display: inline-block;
          opacity: 0;
          transform: translateY(10px);
          animation: fadeInUp 0.8s ease-out forwards;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .confetti-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 99999;
        }
      `}</style>
    </div>
  );
} 