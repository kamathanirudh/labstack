'use client';

import { useEffect, useState } from "react";
import { getLabStatus } from "@/lib/api";

export default function LabPage({ params }: { params: { labId: string } }) {
  const { labId } = params;
  const [status, setStatus] = useState("pending");
  const [accessUrl, setAccessUrl] = useState<string | null>(null);

  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const res = await getLabStatus(labId);
        setStatus(res.status);
        setAccessUrl(res.access_url);
        if (res.status === "ready" && res.access_url) {
          clearInterval(poll);
        }
      } catch (e) {
        console.error("Failed to fetch lab status", e);
      }
    }, 5000);

    return () => clearInterval(poll);
  }, [labId]);

  if (status !== "ready" || !accessUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <h2 className="text-2xl font-semibold mb-4">Launching your lab...</h2>
        <p className="text-gray-600">Please wait while we set up your environment.</p>
      </div>
    );
  }

  // === Render Active Lab Mode UI ===
  return (
    <div className="p-8 max-w-xl mx-auto text-center">
      <h1 className="text-3xl font-bold mb-6">LabStack</h1>
      <h2 className="text-xl font-semibold mb-2">Your Lab is Ready 🎉</h2>
      <p className="text-gray-600 mb-4">Auto-deletes after TTL expires</p>

      <div className="bg-gray-100 rounded-lg p-4 mb-4">
        <p className="text-sm text-gray-700 mb-1">Access your lab:</p>
        <div className="flex items-center justify-center space-x-2">
          <input
            type="text"
            readOnly
            value={accessUrl}
            className="w-full border px-2 py-1 text-sm rounded"
          />
          <button
            onClick={() => navigator.clipboard.writeText(accessUrl)}
            className="text-sm px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
          >
            Copy
          </button>
          <a
            href={accessUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Open Lab
          </a>
        </div>
      </div>

      {/* Actions like Extend/Terminate can be added here */}
    </div>
  );
} 