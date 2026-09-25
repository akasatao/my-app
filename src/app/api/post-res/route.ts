import { revalidatePath } from "next/cache";
import { isInvited } from "@/lib/auth";
import { saveReply } from "@/lib/save-reply";

async function readJson(request: Request) {
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

    const contentType = request.headers.get("content-type") ?? "";
    let threadId = "";
    let replyToRaw = "";
    let body = "";
    let mediaUrl = "";
    let mediaType = "";
    let mediaFile: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const mediaValue = formData.get("media");
      threadId = String(formData.get("threadId") ?? "").trim();
      replyToRaw = String(formData.get("replyTo") ?? "").trim();
      body = typeof formData.get("body") === "string" ? String(formData.get("body")) : "";
      mediaUrl = String(formData.get("mediaUrl") ?? "");
      mediaType = String(formData.get("mediaType") ?? "");
      mediaFile = mediaValue instanceof File && mediaValue.size > 0 ? mediaValue : null;
    } else {
      const payload = await readJson(request);
      threadId = readString(payload, "threadId").trim();
      replyToRaw = readString(payload, "replyTo").trim();
      body = readString(payload, "body");
      mediaUrl = readString(payload, "mediaUrl");
      mediaType = readString(payload, "mediaType");
    }

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
      mediaFile,
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
