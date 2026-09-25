import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  const env = {};
  const text = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index < 0) continue;
    env[trimmed.slice(0, index).trim()] = trimmed.slice(index + 1).trim();
  }
  return env;
}

const env = loadEnvLocal();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service =
  env.SUPABASE_SERVICE_ROLE_KEY && env.SUPABASE_SERVICE_ROLE_KEY !== "YOUR_SUPABASE_SERVICE_ROLE_KEY"
    ? env.SUPABASE_SERVICE_ROLE_KEY
    : "";

if (!url || !anon || url === "YOUR_SUPABASE_URL") {
  console.log("Supabase の環境変数が未設定のため、バケット作成をスキップします。");
  process.exit(0);
}

const supabase = createClient(url, service || anon);
const { data: buckets, error: listError } = await supabase.storage.listBuckets();
if (listError) {
  console.warn("バケット一覧の取得に失敗:", listError.message);
}

const exists = buckets?.some((bucket) => bucket.id === "media" || bucket.name === "media");
if (!exists) {
  const { error } = await supabase.storage.createBucket("media", {
    public: true,
    fileSizeLimit: "15728640",
  });
  if (error && !/already exists|duplicate/i.test(error.message)) {
    console.warn("anon キーではバケット作成が拒否されることがあります:", error.message);
    console.warn("supabase/schema.sql の storage.buckets 部分を SQL Editor で実行するか、SUPABASE_SERVICE_ROLE_KEY を設定してください。");
    process.exit(0);
  }
}

const { error: updateError } = await supabase.storage.updateBucket("media", { public: true });
if (updateError && !/not found/i.test(updateError.message)) {
  console.warn("media バケットの公開設定更新:", updateError.message);
}

console.log("Storage バケット media の準備処理が完了しました。");
