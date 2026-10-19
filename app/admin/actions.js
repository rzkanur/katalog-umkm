"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { buatKoneksiSesiAdmin } from "@/lib/supabase";

/**
 * Server Action untuk login admin memakai email dan password.
 * Bisa dipanggil dari useActionState atau form action langsung.
 */
export async function masukAdmin(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;
  const email = data?.get("email")?.toString().trim();
  const password = data?.get("password")?.toString();

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  let supabase;
  try {
    supabase = await buatKoneksiSesiAdmin();
  } catch (err) {
    return { error: err.message || "Gagal menghubungkan ke layanan autentikasi." };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message === "Invalid login credentials") {
      return { error: "Email atau password salah. Silakan coba lagi." };
    }
    return { error: error.message || "Login gagal. Silakan coba lagi." };
  }

  revalidatePath("/admin", "layout");
  redirect("/admin");
}

/**
 * Server Action untuk logout admin.
 * Mengakhiri sesi pengguna dan mengarahkan kembali ke /admin/login.
 */
export async function keluarAdmin() {
  const supabase = await buatKoneksiSesiAdmin();
  await supabase.auth.signOut();
  revalidatePath("/admin", "layout");
  redirect("/admin/login");
}

