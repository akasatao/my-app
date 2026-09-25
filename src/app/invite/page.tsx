import { AppNav } from "@/components/AppNav";
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
    <>
      <AppNav />
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-24">
        <InviteForm error={error} />
      </div>
    </>
  );
}
