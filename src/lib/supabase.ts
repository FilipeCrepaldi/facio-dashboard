import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.warn(
    "[supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing. " +
      "Copy .env.example to .env and fill in the values."
  );
}

export const supabase = createClient(url ?? "", anonKey ?? "");

export const isSupabaseConfigured = Boolean(url && anonKey);
