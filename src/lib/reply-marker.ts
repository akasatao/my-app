export function stripLeadingReplyMarker(value: string, resNumber?: number) {
  if (resNumber != null) {
    return value.replace(new RegExp(`^>>${resNumber}\\n?`), "");
  }
  return value.replace(/^>>\d+\n?/, "");
}

export function parseReplyTo(body: string) {
  const match = body.match(/^>>(\d+)/);
  return match ? Number(match[1]) : null;
}

export function resolveReplyTo(post: { replyTo?: number; body: string }) {
  return post.replyTo ?? parseReplyTo(post.body);
}
