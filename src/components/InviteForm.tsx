import { submitInvite } from "@/app/actions";

export function InviteForm({ error }: { error?: string }) {
  return (
    <form
      action={submitInvite}
      className="mx-auto w-full max-w-md border border-gray-400 bg-white p-4"
    >
      <p className="mb-3 text-sm">
        この掲示板は招待制です。招待コードを入力してください。
      </p>
      {error ? (
        <p className="mb-3 text-sm font-bold text-red-700">
          招待コードが違います。
        </p>
      ) : null}
      <label className="mb-1 block text-sm" htmlFor="code">
        招待コード
      </label>
      <input
        id="code"
        name="code"
        type="password"
        autoComplete="off"
        required
        className="mb-3 w-full border border-gray-500 bg-white px-2 py-1 text-sm"
      />
      <button
        type="submit"
        className="border border-gray-600 bg-[#eee] px-4 py-1 text-sm hover:bg-[#ddd]"
      >
        入室する
      </button>
    </form>
  );
}
