import type { BoardRepository } from "./board-repository";
import { memoryBoardStore } from "./store";
import { isSupabaseConfigured } from "./supabase";
import { supabaseBoardStore } from "./supabase-store";

/** 掲示板データの入口。環境変数があれば Supabase、なければメモリ。 */
export function getBoard(): BoardRepository {
  return isSupabaseConfigured() ? supabaseBoardStore : memoryBoardStore;
}
