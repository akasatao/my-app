import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  computeInviteToken,
  INVITE_COOKIE,
  POSTER_COOKIE,
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

export async function grantInvite() {
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
