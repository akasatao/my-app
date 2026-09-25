function splitAnchors(body: string) {
  return body.split(/(>>\d+)/g);
}

export function PostBody({ body }: { body: string }) {
  return (
    <p className="mt-1 whitespace-pre-wrap break-words text-[15px] leading-6">
      {splitAnchors(body).map((part, index) => {
        const match = part.match(/^>>(\d+)$/);
        if (!match) {
          return <span key={index}>{part}</span>;
        }
        return (
          <a
            key={index}
            href={`#${match[1]}`}
            className="text-[#0000cc] underline hover:text-red-700"
          >
            {part}
          </a>
        );
      })}
    </p>
  );
}
