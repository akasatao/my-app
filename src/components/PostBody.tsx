function splitAnchors(body: string) {
  return body.split(/(>>\d+)/g);
}

export function PostBody({ body }: { body: string }) {
  return (
    <p className="whitespace-pre-wrap break-words text-slate-800 leading-relaxed">
      {splitAnchors(body).map((part, index) => {
        const match = part.match(/^>>(\d+)$/);
        if (!match) {
          return <span key={index}>{part}</span>;
        }
        return (
          <a
            key={index}
            href={`#${match[1]}`}
            className="mx-0.5 inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-sm font-medium text-sky-700 no-underline hover:bg-sky-100"
          >
            #{match[1]}
          </a>
        );
      })}
    </p>
  );
}
