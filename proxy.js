import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

function bersihkanUrl(url) {
  if (!url) return "";
  return url.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
}

/**
 * Proxy request handler untuk Next.js 16 (pengganti middleware.js).
 * Memproteksi seluruh rute /admin kecuali /admin/login agar hanya bisa diakses admin yang sudah login.
 */
export async function proxy(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const url = bersihkanUrl(process.env.SUPABASE_URL);
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    return response;
  }

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isHalamanLogin = pathname === "/admin/login" || pathname === "/admin/login/";

  // Semua rute /admin kecuali /admin/login wajib login dengan Supabase Auth
  if (pathname.startsWith("/admin") && !isHalamanLogin) {
    if (!user) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};

export default proxy;

