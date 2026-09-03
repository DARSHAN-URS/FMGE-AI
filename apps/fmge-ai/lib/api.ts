import { supabase, isSupabaseConfigured } from "./supabaseClient";

const API_BASE = process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "")
  : "http://localhost:8000";

export function getApiBaseUrl(): string {
  return API_BASE;
}

/**
 * Authenticated fetch helper for FMGE AI that automatically attaches:
 * - Content-Type: application/json
 * - Authorization: Bearer <supabase_access_token> or dev fallback
 */
export async function authenticatedFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = endpoint.startsWith("http://") || endpoint.startsWith("https://")
    ? endpoint
    : `${API_BASE}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  let token: string | null = null;

  if (isSupabaseConfigured()) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      token = session?.access_token || null;
    } catch (e) {
      console.warn("Could not retrieve Supabase session token:", e);
    }
  } else if (typeof window !== "undefined") {
    token = "fmge-dev-token";
  }

  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
