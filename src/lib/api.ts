// In production (Vercel), point to your Railway/Render API URL.
// Leave empty for local dev (uses same-origin /api routes).
export const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}
