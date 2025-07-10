'use client';

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getLabStatus } from "@/lib/api";

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

  // Poll for lab status
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

  // Countdown timer for remaining time
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <h2 className="text-2xl font-semibold mb-4 text-red-500">Error</h2>
        <p className="mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="mt-2 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!activeLab || status !== "ready") {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-200 mb-6" />
        <h2 className="text-2xl font-semibold mb-2">Launching your lab...</h2>
        <p className="text-gray-400">Please wait while we set up your environment.</p>
      </div>
    );
  }

  // === Render Active Lab Mode UI ===
  return (
    <div className="p-8 max-w-xl mx-auto text-center">
      <h1 className="text-3xl font-bold mb-6">LabStack</h1>
      <h2 className="text-xl font-semibold mb-2">Your Lab is Ready 🎉</h2>
      <p className="text-gray-400 mb-4">Auto-deletes after TTL expires</p>
      <div className="bg-gray-900 rounded-lg p-4 mb-4">
        <p className="text-sm text-gray-300 mb-1">Access your lab:</p>
        <div className="flex items-center justify-center space-x-2">
          <input
            type="text"
            readOnly
            value={activeLab.url}
            className="w-full border px-2 py-1 text-sm rounded bg-gray-800 text-gray-100"
          />
          <button
            onClick={() => navigator.clipboard.writeText(activeLab.url)}
            className="text-sm px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            Copy
          </button>
          <a
            href={activeLab.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Open Lab
          </a>
        </div>
      </div>
      <div className="bg-gray-800 rounded-lg p-4 mb-4">
        <div className="text-4xl font-mono font-bold text-[#6366f1] mb-2">
          {formatTime(activeLab.remainingTime)}
        </div>
        <p className="text-gray-400">Time remaining</p>
      </div>
    </div>
  );
} 