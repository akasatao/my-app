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
  updated_at: string;
  post_count: number;
};

type PostRow = {
  id: string;
  thread_id: string;
  res_number: number;
  name: string;
  body: string;
  created_at: string;
  poster_id: string;
  author_key: string;
  edited_at: string | null;
  deleted_at: string | null;
  reply_to: number | null;
  media_url: string | null;
  media_type: "image" | "video" | null;
};

function createId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function iso(value: string) {
  return new Date(value).toISOString();
}

function mapThread(row: ThreadRow): Thread {
  return {
    id: row.id,
    title: row.title,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
    postCount: row.post_count,
  };
}

function mapPost(row: PostRow): Post {
  return {
    id: row.id,
    threadId: row.thread_id,
    resNumber: row.res_number,
    name: row.name,
    body: row.body,
    createdAt: iso(row.created_at),
    posterId: row.poster_id,
    authorKey: row.author_key,
    editedAt: row.edited_at ? iso(row.edited_at) : undefined,
    deletedAt: row.deleted_at ? iso(row.deleted_at) : undefined,
    replyTo: row.reply_to ?? undefined,
    mediaUrl: row.media_url ?? undefined,
    mediaType: row.media_type ?? undefined,
  };
}

class SupabaseBoardStore implements BoardRepository {
  async listThreads(): Promise<Thread[]> {
    const { data, error } = await getSupabase()
      .from("threads")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error || !data) {
      throw error ?? new Error("スレッド一覧の取得に失敗しました");
    }

    return (data as ThreadRow[]).map(mapThread);
  }

  async getThread(id: string): Promise<Thread | null> {
    const { data, error } = await getSupabase()
      .from("threads")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data ? mapThread(data as ThreadRow) : null;
  }

  async getPosts(threadId: string): Promise<Post[]> {
    const { data, error } = await getSupabase()
      .from("posts")
      .select("*")
      .eq("thread_id", threadId)
      .order("res_number", { ascending: true });

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
    const id = createId("thread");
    const createdAt = new Date().toISOString();

    const { data: threadRow, error: threadError } = await supabase
      .from("threads")
      .insert({
        id,
        title: input.title,
        created_at: createdAt,
        updated_at: createdAt,
        post_count: 1,
      })
      .select("*")
      .single();

    if (threadError || !threadRow) {
      throw threadError ?? new Error("スレッドの作成に失敗しました");
    }

    const { data: postRow, error: postError } = await supabase
      .from("posts")
      .insert({
        id: createId("post"),
        thread_id: id,
        res_number: 1,
        name: input.name,
        body: input.body,
        created_at: createdAt,
        poster_id: input.posterId,
        author_key: input.authorKey,
      })
      .select("*")
      .single();

    if (postError || !postRow) {
      await supabase.from("threads").delete().eq("id", id);
      throw postError ?? new Error("最初の投稿の作成に失敗しました");
    }

    return {
      thread: mapThread(threadRow as ThreadRow),
      posts: [mapPost(postRow as PostRow)],
    };
  }

  async addPost(input: AddPostInput): Promise<Post | null> {
    const supabase = getSupabase();
    const thread = await this.getThread(input.threadId);
    if (!thread) return null;

    const { data: last } = await supabase
      .from("posts")
      .select("res_number")
      .eq("thread_id", input.threadId)
      .order("res_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    const createdAt = new Date().toISOString();
    const resNumber = ((last as { res_number?: number } | null)?.res_number ?? 0) + 1;

    const { data: postRow, error: postError } = await supabase
      .from("posts")
      .insert({
        id: createId("post"),
        thread_id: input.threadId,
        res_number: resNumber,
        name: input.name,
        body: input.body,
        created_at: createdAt,
        poster_id: input.posterId,
        author_key: input.authorKey,
        reply_to: input.replyTo ?? null,
        media_url: input.mediaUrl ?? null,
        media_type: input.mediaType ?? null,
      })
      .select("*")
      .single();

    if (postError || !postRow) {
      throw postError ?? new Error("投稿の作成に失敗しました");
    }

    const { error: threadError } = await supabase
      .from("threads")
      .update({
        updated_at: createdAt,
        post_count: resNumber,
      })
      .eq("id", input.threadId);

    if (threadError) throw threadError;

    return mapPost(postRow as PostRow);
  }

  async updatePost(input: UpdatePostInput): Promise<Post | null> {
    const supabase = getSupabase();
    const { data: current, error: loadError } = await supabase
      .from("posts")
      .select("*")
      .eq("id", input.postId)
      .eq("thread_id", input.threadId)
      .maybeSingle();

    if (loadError) throw loadError;
    if (!current) return null;

    const row = current as PostRow;
    if (!row.author_key || row.author_key !== input.authorKey) return null;
    if (row.deleted_at) return null;

    const editedAt = new Date().toISOString();
    const { data: updated, error } = await supabase
      .from("posts")
      .update({
        name: input.name,
        body: input.body,
        edited_at: editedAt,
      })
      .eq("id", input.postId)
      .select("*")
      .single();

    if (error || !updated) {
      throw error ?? new Error("投稿の更新に失敗しました");
    }

    await supabase
      .from("threads")
      .update({ updated_at: editedAt })
      .eq("id", input.threadId);

    return mapPost(updated as PostRow);
  }

  async deletePost(input: DeletePostInput): Promise<Post | null> {
    const supabase = getSupabase();
    const { data: current, error: loadError } = await supabase
      .from("posts")
      .select("*")
      .eq("id", input.postId)
      .eq("thread_id", input.threadId)
      .maybeSingle();

    if (loadError) throw loadError;
    if (!current) return null;

    const row = current as PostRow;
    if (!row.author_key || row.author_key !== input.authorKey) return null;
    if (row.deleted_at) return mapPost(row);

    const deletedAt = new Date().toISOString();
    const { data: updated, error } = await supabase
      .from("posts")
      .update({
        body: "削除されました",
        deleted_at: deletedAt,
      })
      .eq("id", input.postId)
      .select("*")
      .single();

    if (error || !updated) {
      throw error ?? new Error("投稿の削除に失敗しました");
    }

    await supabase
      .from("threads")
      .update({ updated_at: deletedAt })
      .eq("id", input.threadId);

    return mapPost(updated as PostRow);
  }

  async updateThread(input: UpdateThreadInput): Promise<Thread | null> {
    const updatedAt = new Date().toISOString();
    const { data, error } = await getSupabase()
      .from("threads")
      .update({
        title: input.title,
        updated_at: updatedAt,
      })
      .eq("id", input.threadId)
      .select("*")
      .maybeSingle();

    if (error) throw error;
    return data ? mapThread(data as ThreadRow) : null;
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
