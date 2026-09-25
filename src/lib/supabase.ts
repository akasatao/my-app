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
let adminClient: SupabaseClient | null = null;

function supabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
}

function anonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
}

function serviceRoleKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
  if (!key || key === "YOUR_SUPABASE_SERVICE_ROLE_KEY") return "";
  return key;
}

export function getSupabase() {
  const url = supabaseUrl();
  const key = anonKey();

  if (!url || !key) {
    throw new Error("Supabase の環境変数が設定されていません");
  }

  if (!client) {
    client = createClient(url, key);
  }

  return client;
}

/** バケット作成・アップロード用。service_role があればそれを使う。 */
export function getSupabaseAdmin() {
  const url = supabaseUrl();
  const key = serviceRoleKey() || anonKey();

  if (!url || !key) {
    throw new Error("Supabase の環境変数が設定されていません");
  }

  if (serviceRoleKey()) {
    if (!adminClient) {
      adminClient = createClient(url, key);
    }
    return adminClient;
  }

  return getSupabase();
}
