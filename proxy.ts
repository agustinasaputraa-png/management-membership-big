import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          supabaseResponse = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // Ambil dan verifikasi JWT session
  const { data, error } = await supabase.auth.getClaims();

  const claims = data?.claims;

  const pathname = request.nextUrl.pathname;

  const isLoginPage = pathname === "/login";

  const isProtectedPage =
    pathname === "/" ||
    pathname.startsWith("/members") ||
    pathname.startsWith("/prospects") ||
    pathname.startsWith("/settings");

  // Belum login: arahkan ke halaman login
  if (isProtectedPage && (error || !claims)) {
    const loginUrl = new URL("/login", request.url);

    return NextResponse.redirect(loginUrl);
  }

  // Sudah login: arahkan dari login ke dashboard
  if (isLoginPage && !error && claims) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/members/:path*",
    "/prospects/:path*",
    "/settings/:path*",
  ],
};
