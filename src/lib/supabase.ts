import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  return (
    url.length > 0 &&
    key.length > 0 &&
    url !== "YOUR_SUPABASE_URL" &&
    key !== "YOUR_SUPABASE_ANON_KEY"
  );
}

let client: SupabaseClient | null = null;

export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !key) {
    throw new Error("Supabase の環境変数が設定されていません");
  }

  if (!client) {
    client = createClient(url, key);
  }

  return client;
}
