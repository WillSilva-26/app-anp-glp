const API_URL = import.meta.env.VITE_API_URL;

export async function fetchRevendas() {
  const res = await fetch(`${API_URL}/api/revendas`);
  return res.json();
}

export async function fetchMeta() {
  const res = await fetch(`${API_URL}/api/meta`);
  return res.json();
}
