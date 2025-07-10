export async function createLab(labType: string, ttl = 15): Promise<string> {
  const res = await fetch("https://vmuv90nfpl.execute-api.ap-south-1.amazonaws.com/labs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ lab_type: labType, ttl })
  });

  const data = await res.json();
  return data.lab_id; // string
}

export async function getLabStatus(labId: string): Promise<{ status: string; access_url: string | null }> {
  const res = await fetch(`https://vmuv90nfpl.execute-api.ap-south-1.amazonaws.com/labs/${labId}/status`);
  return await res.json(); // { status, access_url }
} 