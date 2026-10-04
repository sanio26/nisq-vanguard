import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Supabase URL is missing.");
}

if (!supabaseAnonKey) {
  throw new Error("Supabase publishable key is missing.");
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);