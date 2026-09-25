import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { computeInviteToken, INVITE_COOKIE } from "@/lib/invite-token";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(INVITE_COOKIE)?.value;
  const invited = token === computeInviteToken();

  if (pathname === "/invite") {
    if (invited) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (!invited) {
    const inviteUrl = new URL("/invite", request.url);
    return NextResponse.redirect(inviteUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
