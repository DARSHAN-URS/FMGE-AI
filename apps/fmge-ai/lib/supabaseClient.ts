import { createClient, SupabaseClient } from "@supabase/supabase-js";

export const isSupabaseConfigured = (): boolean => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
    key &&
    !url.includes("your-supabase-project") &&
    !url.includes("placeholder") &&
    !key.includes("your-supabase-anon-key") &&
    !key.includes("placeholder")
  );
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: isSupabaseConfigured(),
    detectSessionInUrl: isSupabaseConfigured(),
  },
});
