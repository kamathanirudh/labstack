'use client';

import { useEffect, useState } from "react";
import { getLabStatus } from "@/lib/api";

export default function LabPage({ params }: { params: { labId: string } }) {
  const { labId } = params;
  const [status, setStatus] = useState<string | null>(null);
  const [accessUrl, setAccessUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let poll: NodeJS.Timeout;
    const fetchStatus = async () => {
      try {
        const res = await getLabStatus(labId);
        setStatus(res.status);
        setAccessUrl(res.access_url);
        if (res.status === "error") {
          setError("Failed to launch the lab. Please try again.");
          clearInterval(poll);
        } else if (res.status === "ready" && res.access_url) {
          setError(null);
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
  }, [labId]);

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

  if (status !== "ready" || !accessUrl) {
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
            value={accessUrl}
            className="w-full border px-2 py-1 text-sm rounded bg-gray-800 text-gray-100"
          />
          <button
            onClick={() => navigator.clipboard.writeText(accessUrl)}
            className="text-sm px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            Copy
          </button>
          <a
            href={accessUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Open Lab
          </a>
        </div>
      </div>
    </div>
  );
} 