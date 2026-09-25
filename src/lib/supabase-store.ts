import type { BoardRepository } from "./board-repository";
import { getSupabase } from "./supabase";
import type {
  AddPostInput,
  CreateThreadInput,
  DeletePostInput,
  DeleteThreadInput,
  Post,
  Thread,
  ThreadWithPosts,
  UpdatePostInput,
  UpdateThreadInput,
} from "./types";

type ThreadRow = {
  id: string;
  title: string;
  created_at: string;
};

type PostRow = {
  id: string;
  thread_id: string;
  no: number;
  name: string;
  body: string;
  media_url: string | null;
  media_type: "image" | "video" | "audio" | null;
  reply_to_no: number | null;
  reply_to_name: string | null;
  reply_to_body: string | null;
  user_id: string | null;
  created_at: string;
};

const THREAD_COLUMNS = "id, title, created_at";
const POST_COLUMNS =
  "id, thread_id, no, name, body, media_url, media_type, reply_to_no, reply_to_name, reply_to_body, user_id, created_at";

function createThreadId() {
  return `thread_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function iso(value: string) {
  return new Date(value).toISOString();
}

function mapThread(row: ThreadRow, postCount = 0, updatedAt?: string): Thread {
  return {
    id: row.id,
    title: row.title,
    createdAt: iso(row.created_at),
    updatedAt: iso(updatedAt ?? row.created_at),
    postCount,
  };
}

function mapPost(row: PostRow): Post {
  const deleted = row.body === "削除されました";
  return {
    id: String(row.id),
    threadId: row.thread_id,
    resNumber: row.no,
    name: row.name,
    body: row.body,
    createdAt: iso(row.created_at),
    posterId: row.user_id ?? "",
    authorKey: row.user_id ?? "",
    deletedAt: deleted ? iso(row.created_at) : undefined,
    replyTo: row.reply_to_no ?? undefined,
    mediaUrl: row.media_url ?? undefined,
    mediaType:
      row.media_type === "image" || row.media_type === "video" || row.media_type === "audio"
        ? row.media_type
        : undefined,
  };
}

class SupabaseBoardStore implements BoardRepository {
  async listThreads(): Promise<Thread[]> {
    const supabase = getSupabase();
    const { data: threads, error: threadError } = await supabase
      .from("threads")
      .select(THREAD_COLUMNS)
      .order("created_at", { ascending: false });

    if (threadError || !threads) {
      throw threadError ?? new Error("スレッド一覧の取得に失敗しました");
    }

    const { data: posts, error: postError } = await supabase
      .from("posts")
      .select("thread_id, no, created_at");

    if (postError) throw postError;

    const stats = new Map<string, { count: number; updatedAt: string }>();
    for (const post of posts ?? []) {
      const row = post as { thread_id: string; no: number; created_at: string };
      const current = stats.get(row.thread_id);
      if (!current) {
        stats.set(row.thread_id, { count: 1, updatedAt: row.created_at });
        continue;
      }
      current.count += 1;
      if (Date.parse(row.created_at) > Date.parse(current.updatedAt)) {
        current.updatedAt = row.created_at;
      }
    }

    return (threads as ThreadRow[])
      .map((thread) => {
        const stat = stats.get(thread.id);
        return mapThread(thread, stat?.count ?? 0, stat?.updatedAt);
      })
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  }

  async getThread(id: string): Promise<Thread | null> {
    const { data, error } = await getSupabase()
      .from("threads")
      .select(THREAD_COLUMNS)
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const posts = await this.getPosts(id);
    const latest = posts.at(-1)?.createdAt;
    return mapThread(data as ThreadRow, posts.length, latest);
  }

  async getPosts(threadId: string): Promise<Post[]> {
    const { data, error } = await getSupabase()
      .from("posts")
      .select(POST_COLUMNS)
      .eq("thread_id", threadId)
      .order("no", { ascending: true });

    if (error || !data) {
      throw error ?? new Error("投稿の取得に失敗しました");
    }

    return (data as PostRow[]).map(mapPost);
  }

  async getThreadWithPosts(id: string): Promise<ThreadWithPosts | null> {
    const thread = await this.getThread(id);
    if (!thread) return null;
    const posts = await this.getPosts(id);
    return { thread, posts };
  }

  async createThread(input: CreateThreadInput): Promise<ThreadWithPosts> {
    const supabase = getSupabase();
    const id = createThreadId();
    const createdAt = new Date().toISOString();

    const { data: threadRow, error: threadError } = await supabase
      .from("threads")
      .insert({
        id,
        title: input.title,
        created_at: createdAt,
      })
      .select(THREAD_COLUMNS)
      .single();

    if (threadError || !threadRow) {
      throw threadError ?? new Error("スレッドの作成に失敗しました");
    }

    const { data: postRow, error: postError } = await supabase
      .from("posts")
      .insert({
        thread_id: id,
        no: 1,
        name: input.name,
        body: input.body,
        media_url: null,
        media_type: null,
        reply_to_no: null,
        reply_to_name: null,
        reply_to_body: null,
        user_id: input.authorKey,
        created_at: createdAt,
      })
      .select(POST_COLUMNS)
      .single();

    if (postError || !postRow) {
      await supabase.from("threads").delete().eq("id", id);
      throw postError ?? new Error("最初の投稿の作成に失敗しました");
    }

    return {
      thread: mapThread(threadRow as ThreadRow, 1, createdAt),
      posts: [mapPost(postRow as PostRow)],
    };
  }

  async addPost(input: AddPostInput): Promise<Post | null> {
    const supabase = getSupabase();
    const thread = await this.getThread(input.threadId);
    if (!thread) return null;

    const { data: last } = await supabase
      .from("posts")
      .select("no")
      .eq("thread_id", input.threadId)
      .order("no", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextNo = ((last as { no?: number } | null)?.no ?? 0) + 1;
    let replyToName: string | null = null;
    let replyToBody: string | null = null;

    if (input.replyTo != null) {
      const { data: parent } = await supabase
        .from("posts")
        .select("name, body")
        .eq("thread_id", input.threadId)
        .eq("no", input.replyTo)
        .maybeSingle();

      if (parent) {
        replyToName = (parent as { name: string }).name;
        replyToBody = (parent as { body: string }).body;
      }
    }

    const createdAt = new Date().toISOString();
    const { data: postRow, error: postError } = await supabase
      .from("posts")
      .insert({
        thread_id: input.threadId,
        no: nextNo,
        name: input.name,
        body: input.body,
        media_url: input.mediaUrl ?? null,
        media_type: input.mediaType ?? null,
        reply_to_no: input.replyTo ?? null,
        reply_to_name: replyToName,
        reply_to_body: replyToBody,
        user_id: input.authorKey,
        created_at: createdAt,
      })
      .select(POST_COLUMNS)
      .single();

    if (postError || !postRow) {
      throw postError ?? new Error("投稿の作成に失敗しました");
    }

    return mapPost(postRow as PostRow);
  }

  async updatePost(input: UpdatePostInput): Promise<Post | null> {
    const supabase = getSupabase();
    const { data: current, error: loadError } = await supabase
      .from("posts")
      .select(POST_COLUMNS)
      .eq("id", input.postId)
      .eq("thread_id", input.threadId)
      .maybeSingle();

    if (loadError) throw loadError;
    if (!current) return null;

    const row = current as PostRow;
    if (!row.user_id || row.user_id !== input.authorKey) return null;
    if (row.body === "削除されました") return null;

    const { data: updated, error } = await supabase
      .from("posts")
      .update({
        name: input.name,
        body: input.body,
      })
      .eq("id", input.postId)
      .select(POST_COLUMNS)
      .single();

    if (error || !updated) {
      throw error ?? new Error("投稿の更新に失敗しました");
    }

    return mapPost(updated as PostRow);
  }

  async deletePost(input: DeletePostInput): Promise<Post | null> {
    const supabase = getSupabase();
    const { data: current, error: loadError } = await supabase
      .from("posts")
      .select(POST_COLUMNS)
      .eq("id", input.postId)
      .eq("thread_id", input.threadId)
      .maybeSingle();

    if (loadError) throw loadError;
    if (!current) return null;

    const row = current as PostRow;
    if (!row.user_id || row.user_id !== input.authorKey) return null;
    if (row.body === "削除されました") return mapPost(row);

    const { data: updated, error } = await supabase
      .from("posts")
      .update({
        body: "削除されました",
        media_url: null,
        media_type: null,
      })
      .eq("id", input.postId)
      .select(POST_COLUMNS)
      .single();

    if (error || !updated) {
      throw error ?? new Error("投稿の削除に失敗しました");
    }

    return mapPost(updated as PostRow);
  }

  async updateThread(input: UpdateThreadInput): Promise<Thread | null> {
    const { data, error } = await getSupabase()
      .from("threads")
      .update({
        title: input.title,
      })
      .eq("id", input.threadId)
      .select(THREAD_COLUMNS)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const posts = await this.getPosts(input.threadId);
    const latest = posts.at(-1)?.createdAt;
    return mapThread(data as ThreadRow, posts.length, latest);
  }

  async deleteThread(input: DeleteThreadInput): Promise<boolean> {
    const { data, error } = await getSupabase()
      .from("threads")
      .delete()
      .eq("id", input.threadId)
      .select("id")
      .maybeSingle();

    if (error) throw error;
    return Boolean(data);
  }
}

export const supabaseBoardStore = new SupabaseBoardStore();
