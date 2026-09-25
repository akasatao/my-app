export function PostBody({ body }: { body: string }) {
  return (
    <p className="whitespace-pre-wrap break-words text-slate-800 leading-relaxed">
      {body}
    </p>
  );
}
