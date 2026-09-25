import { BoardHeader } from "@/components/BoardHeader";
import { InviteForm } from "@/components/InviteForm";
import { isInvited } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function InvitePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isInvited()) {
    redirect("/");
  }

  const { error } = await searchParams;

  return (
    <div className="mx-auto w-full max-w-4xl px-3 py-6 sm:px-6">
      <BoardHeader />
      <div className="mt-8">
        <InviteForm error={error} />
      </div>
    </div>
  );
}
