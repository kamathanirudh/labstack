'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getLabStatus } from "@/lib/api";

export default function LabPage({ params }: { params: { labId: string } }) {
  const { labId } = params;
  const [status, setStatus] = useState("pending");
  const [accessUrl, setAccessUrl] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const poll = async () => {
      const interval = setInterval(async () => {
        const res = await getLabStatus(labId);
        setStatus(res.status);
        setAccessUrl(res.access_url);
        if (res.status === "ready" && res.access_url) {
          clearInterval(interval);
          window.location.href = res.access_url;
        }
      }, 5000);
      return () => clearInterval(interval);
    };
    poll();
  }, [labId]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-xl font-semibold">Launching your lab...</h2>
      <p>Status: {status}</p>
      {accessUrl && <p>URL: {accessUrl}</p>}
    </div>
  );
} 