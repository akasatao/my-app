import { createHash } from "crypto";

function ymdJst(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** 日替わりの投稿者ID（同じ seed なら同日は同じID） */
export function dailyPosterId(seed: string, date = new Date()) {
  return createHash("sha256")
    .update(`${seed}:${ymdJst(date)}`)
    .digest("base64url")
    .slice(0, 8);
}
