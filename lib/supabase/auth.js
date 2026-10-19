import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function bersihkanUrl(url) {
  if (!url) return "";
  return url.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
}

/**
 * Membuat client Supabase dengan sesi berbasis cookie untuk server (@supabase/ssr).
 * Digunakan untuk autentikasi (login, logout, ganti password) dan aksi admin yang memerlukan sesi.
 */
export async function buatKoneksiSesiAdmin() {
  const cookieStore = await cookies();
  const url = bersihkanUrl(process.env.SUPABASE_URL);
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      "SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY wajib diisi di environment variable."
    );
  }

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  });
}

export const createAdminSessionClient = buatKoneksiSesiAdmin;
export const buatKoneksiAuth = buatKoneksiSesiAdmin;

