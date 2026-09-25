const AVATAR_TONES = [
  "bg-sky-100 text-sky-700",
  "bg-indigo-100 text-indigo-700",
  "bg-cyan-100 text-cyan-700",
  "bg-slate-200 text-slate-700",
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
] as const;

function toneFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash + seed.charCodeAt(i) * (i + 1)) % AVATAR_TONES.length;
  }
  return AVATAR_TONES[hash];
}

export function Avatar({ name, seed }: { name: string; seed: string }) {
  const initial = Array.from(name.trim() || "?")[0] ?? "?";

  return (
    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${toneFor(seed)}`}
      aria-hidden
    >
      {initial}
    </span>
  );
}
