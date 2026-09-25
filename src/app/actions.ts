"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getOrCreatePosterSeed, grantInvite, requireInvite } from "@/lib/auth";
import { getBoard } from "@/lib/board";
import { displayName } from "@/lib/format";
import { inviteCodeMatches } from "@/lib/invite-token";
import { dailyPosterId } from "@/lib/poster-id";

function readField(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.replace(/\r\n/g, "\n") : "";
}

export async function submitInvite(formData: FormData) {
  const code = readField(formData, "code");
  if (!inviteCodeMatches(code)) {
    redirect("/invite?error=1");
  }
  await grantInvite();
  redirect("/");
}

export async function createThread(formData: FormData) {
  await requireInvite();

  const title = readField(formData, "title").trim();
  const body = readField(formData, "body").trim();
  const name = displayName(readField(formData, "name"));

  if (!title || !body) {
    redirect("/?error=1");
  }

  if (title.length > 80 || body.length > 4000 || name.length > 20) {
    redirect("/?error=2");
  }

  const posterId = dailyPosterId(await getOrCreatePosterSeed());
  const created = await getBoard().createThread({
    title,
    name,
    body,
    posterId,
  });

  revalidatePath("/");
  revalidatePath(`/thread/${created.thread.id}`);
  redirect(`/thread/${created.thread.id}`);
}

export async function addReply(formData: FormData) {
  await requireInvite();

  const threadId = readField(formData, "threadId");
  const body = readField(formData, "body").trim();
  const name = displayName(readField(formData, "name"));

  if (!threadId) {
    redirect("/");
  }

  if (!body) {
    redirect(`/thread/${threadId}?error=1`);
  }

  if (body.length > 4000 || name.length > 20) {
    redirect(`/thread/${threadId}?error=2`);
  }

  const posterId = dailyPosterId(await getOrCreatePosterSeed());
  const post = await getBoard().addPost({
    threadId,
    name,
    body,
    posterId,
  });

  if (!post) {
    redirect("/");
  }

  revalidatePath("/");
  revalidatePath(`/thread/${threadId}`);
  redirect(`/thread/${threadId}#${post.resNumber}`);
}
