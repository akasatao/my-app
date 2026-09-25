import type { BoardRepository } from "./board-repository";
import { memoryBoardStore } from "./store";

/** 掲示板データの入口。将来は supabaseBoardStore などに差し替える。 */
export function getBoard(): BoardRepository {
  return memoryBoardStore;
}
