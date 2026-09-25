import { submitInvite } from "@/app/actions";
import { fieldClass, primaryButtonClass } from "@/components/ui";

function InviteGraphic() {
  return (
    <svg
      viewBox="0 0 160 120"
      className="mx-auto h-28 w-auto text-sky-600"
      aria-hidden
    >
      <rect x="48" y="46" width="64" height="50" rx="12" fill="currentColor" opacity="0.12" />
      <path
        d="M64 52V40a16 16 0 0 1 32 0v12"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <rect x="52" y="52" width="56" height="44" rx="10" fill="currentColor" />
      <circle cx="80" cy="72" r="6" fill="white" />
      <rect x="77" y="72" width="6" height="12" rx="3" fill="white" />
    </svg>
  );
}

export function InviteForm({ error }: { error?: string }) {
  return (
    <form
      action={submitInvite}
      className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
    >
      <InviteGraphic />
      <h1 className="mt-4 text-center text-2xl font-bold text-slate-950">
        秘密の場所へのアクセス
      </h1>
      <p className="mt-2 text-center text-sm leading-relaxed text-slate-500">
        招待コードを持つメンバーだけが入れる、クローズドなラウンジです。
      </p>
      {error ? (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600">
          招待コードが違います。
        </p>
      ) : null}
      <label className="mt-6 mb-1.5 block text-sm font-medium text-slate-700" htmlFor="code">
        招待コード
      </label>
      <input
        id="code"
        name="code"
        type="password"
        autoComplete="off"
        required
        className={fieldClass}
      />
      <button type="submit" className={`mt-5 w-full ${primaryButtonClass}`}>
        入室する
      </button>
    </form>
  );
}
