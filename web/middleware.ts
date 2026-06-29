import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Authed golfer portal routes — listed so middleware both refreshes the
// Supabase session AND guards them. (The pages also redirect via loadGolfer,
// but middleware must run here so the @supabase/ssr session stays fresh.)
const PROTECTED_GOLFER = [
  "/golfer/dashboard",
  "/golfer/book",
  "/golfer/stats",
  "/golfer/leaderboards",
  "/golfer/tournaments",
];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          toSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  // Protect all /admin routes except /admin/login
  if (pathname.startsWith("/admin") && pathname !== "/admin/login" && !user) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Redirect signed-in operators away from login
  if (pathname === "/admin/login" && user) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  // Protect the golfer portal
  const isProtectedGolfer = PROTECTED_GOLFER.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (isProtectedGolfer && !user) {
    return NextResponse.redirect(new URL("/golfer/login", request.url));
  }

  // Redirect signed-in golfers away from the auth pages
  if ((pathname === "/golfer/login" || pathname === "/golfer/signup") && user) {
    return NextResponse.redirect(new URL("/golfer/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/golfer/login",
    "/golfer/signup",
    "/golfer/dashboard/:path*",
    "/golfer/book/:path*",
    "/golfer/stats/:path*",
    "/golfer/leaderboards/:path*",
    "/golfer/tournaments/:path*",
  ],
};
