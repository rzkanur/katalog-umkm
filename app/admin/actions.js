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

/**
 * Server Action untuk mengganti password admin yang sedang login.
 * Memvalidasi panjang minimal 8 karakter dan kesamaan konfirmasi di server.
 */
export async function gantiPassword(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;
  const passwordBaru = data?.get("password_baru")?.toString() || "";
  const konfirmasiPassword = data?.get("konfirmasi_password")?.toString() || "";

  if (!passwordBaru || !konfirmasiPassword) {
    return { error: "Password baru dan konfirmasi password wajib diisi." };
  }

  if (passwordBaru.length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }

  if (passwordBaru !== konfirmasiPassword) {
    return { error: "Password baru dan konfirmasi password tidak sama." };
  }

  let supabase;
  try {
    supabase = await buatKoneksiSesiAdmin();
  } catch (err) {
    return { error: err.message || "Gagal menghubungkan ke layanan autentikasi." };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Sesi telah berakhir atau kamu belum login. Silakan login kembali." };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: passwordBaru,
  });

  if (updateError) {
    if (updateError.message.includes("different from the old password")) {
      return { error: "Password baru harus berbeda dari password lama." };
    }
    return {
      error: updateError.message || "Gagal mengganti password. Silakan coba lagi.",
    };
  }

  return { success: "Password berhasil diganti." };
}

export const gantiPasswordAdmin = gantiPassword;


