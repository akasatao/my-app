import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  computeInviteToken,
  INVITE_COOKIE,
  POSTER_COOKIE,
  USER_NAME_COOKIE,
} from "./invite-token";

const THIRTY_DAYS = 60 * 60 * 24 * 30;

export async function isInvited() {
  const store = await cookies();
  return store.get(INVITE_COOKIE)?.value === computeInviteToken();
}

export async function requireInvite() {
  if (!(await isInvited())) {
    redirect("/invite");
  }
}

export async function grantInvite(userName: string) {
  const store = await cookies();
  store.set(INVITE_COOKIE, computeInviteToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: THIRTY_DAYS,
    secure: process.env.NODE_ENV === "production",
  });

  if (!store.get(POSTER_COOKIE)?.value) {
    store.set(POSTER_COOKIE, crypto.randomUUID(), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: THIRTY_DAYS,
      secure: process.env.NODE_ENV === "production",
    });
  }

  await saveUserName(userName);
}

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: THIRTY_DAYS,
  secure: process.env.NODE_ENV === "production",
};

export async function saveUserName(name: string) {
  const trimmed = name.trim();
  const store = await cookies();
  store.set(USER_NAME_COOKIE, encodeURIComponent(trimmed), cookieOptions);
}

export async function getUserName() {
  const store = await cookies();
  const raw = store.get(USER_NAME_COOKIE)?.value;
  if (!raw) return "";
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export async function getPosterSeed() {
  const store = await cookies();
  return store.get(POSTER_COOKIE)?.value ?? null;
}

export async function getOrCreatePosterSeed() {
  const store = await cookies();
  const existing = store.get(POSTER_COOKIE)?.value;
  if (existing) return existing;

  const seed = crypto.randomUUID();
  store.set(POSTER_COOKIE, seed, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: THIRTY_DAYS,
    secure: process.env.NODE_ENV === "production",
  });
  return seed;
}
