export const INVITE_COOKIE = "board_gate";
export const POSTER_COOKIE = "board_anon";

export function getInviteCode() {
  return process.env.INVITE_CODE || "secret123";
}

/** proxy（Edge）でも使えるよう Node crypto に依存しない。 */
export function computeInviteToken() {
  const payload = `invite-ok:${getInviteCode()}`;
  let hash = 2166136261;
  for (let i = 0; i < payload.length; i += 1) {
    hash ^= payload.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `inv_${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

export function inviteCodeMatches(input: string) {
  return input.trim() === getInviteCode();
}
