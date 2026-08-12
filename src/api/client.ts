export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function authFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  // some error responses (network fail, empty body, non-JSON) won't parse —
  // fall back to {} so we still hit the !res.ok check below instead of throwing here
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  return data;
}
