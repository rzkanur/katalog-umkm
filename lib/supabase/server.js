import { createClient } from "@supabase/supabase-js";

function bersihkanUrl(url) {
  if (!url) return "";
  return url.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
}

/**
 * Membuat koneksi Supabase untuk server menggunakan SUPABASE_URL dan SUPABASE_SECRET_KEY.
 * Digunakan untuk membaca data publik (katalog dan detail produk) di sisi server.
 */
export function buatKoneksiServer() {
  const url = bersihkanUrl(process.env.SUPABASE_URL);
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error(
      "SUPABASE_URL dan SUPABASE_SECRET_KEY wajib diisi di environment variable."
    );
  }

  return createClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export const createServerClient = buatKoneksiServer;
export default buatKoneksiServer;

