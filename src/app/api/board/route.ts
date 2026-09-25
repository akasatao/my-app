import { revalidatePath } from "next/cache";
import { isInvited } from "@/lib/auth";
import { getBoard } from "@/lib/board";

async function unauthorized() {
  if (!(await isInvited())) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}

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

function serverError(error: unknown) {
  console.error(error);
  return Response.json({ error: "server_error" }, { status: 500 });
}

export async function PUT(request: Request) {
  try {
    const denied = await unauthorized();
    if (denied) return denied;

    const body = await readBody(request);
    const threadId = readString(body, "threadId").trim();
    const title = readString(body, "title").trim();

    if (!threadId || !title) {
      return Response.json({ error: "invalid" }, { status: 400 });
    }

    if (title.length > 80) {
      return Response.json({ error: "too_long" }, { status: 400 });
    }

    const thread = await getBoard().updateThread({ threadId, title });
    if (!thread) {
      return Response.json({ error: "not_found" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath(`/thread/${threadId}`);
    return Response.json({ thread });
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(request: Request) {
  return PUT(request);
}

export async function DELETE(request: Request) {
  try {
    const denied = await unauthorized();
    if (denied) return denied;

    const url = new URL(request.url);
    const body = await readBody(request);
    const threadId =
      readString(body, "threadId").trim() || url.searchParams.get("threadId")?.trim() || "";

    if (!threadId) {
      return Response.json({ error: "invalid" }, { status: 400 });
    }

    const deleted = await getBoard().deleteThread({ threadId });
    if (!deleted) {
      return Response.json({ error: "not_found" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath(`/thread/${threadId}`);
    return Response.json({ ok: true });
  } catch (error) {
    return serverError(error);
  }
}
