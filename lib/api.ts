const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function createLab(labType: string, ttl = 15): Promise<string> {
  const res = await fetch(`${API_BASE}/labs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lab_type: labType, ttl })
  });
  if (!res.ok) throw new Error(`Create failed ${res.status}`);
  const { lab_id } = await res.json();
  return lab_id;
}

export async function getLabStatus(labId: string) {
  const res = await fetch(`${API_BASE}/labs/${labId}/status`);
  if (!res.ok) throw new Error(`Status check failed ${res.status}`);
  return res.json(); // { status, access_url }
}

export async function terminateLab(labId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/labs/${labId}/terminate`, {
    method: "POST",
  });
  if (!res.ok) {
    throw new Error(`Failed to terminate lab: ${res.status}`);
  }
} 