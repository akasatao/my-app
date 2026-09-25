import { revalidatePath } from "next/cache";
import { isInvited } from "@/lib/auth";
import { saveReply } from "@/lib/save-reply";

async function readBody(request: Request) {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function readString(body: Record<string, unknown> | null, key: string) {
  const value = body?.[key];
  return typeof value === "string" ? value : "";
}

export async function POST(request: Request) {
  try {
    if (!(await isInvited())) {
      return Response.json({ error: "unauthorized" }, { status: 401 });
    }

    const payload = await readBody(request);
    const threadId = readString(payload, "threadId").trim();
    const replyToRaw = readString(payload, "replyTo").trim();
    const body = readString(payload, "body");
    const mediaUrl = readString(payload, "mediaUrl");
    const mediaType = readString(payload, "mediaType");

    if (!threadId) {
      return Response.json({ error: "invalid" }, { status: 400 });
    }

    const replyTo =
      replyToRaw && /^\d+$/.test(replyToRaw) ? Number(replyToRaw) : undefined;

    const result = await saveReply({
      threadId,
      body,
      replyTo,
      mediaUrl,
      mediaType,
    });

    if (result.error === "empty") {
      return Response.json({ error: "empty" }, { status: 400 });
    }
    if (result.error === "too_long" || result.error === "media") {
      return Response.json({ error: result.error }, { status: 400 });
    }
    if (!result.post) {
      return Response.json({ error: "not_found" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath(`/thread/${threadId}`);
    return Response.json({ post: result.post });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}
