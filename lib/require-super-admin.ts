import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function requireSuperAdmin() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      authorized: false as const,
      status: 401,
      message: "Silakan login terlebih dahulu.",
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("user_id, full_name, email, role, is_active")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError || !profile || !profile.is_active) {
    return {
      authorized: false as const,
      status: 403,
      message: "Akun tidak aktif atau profil tidak ditemukan.",
    };
  }

  if (profile.role !== "SUPER_ADMIN") {
    return {
      authorized: false as const,
      status: 403,
      message: "Akses hanya untuk Super Admin.",
    };
  }

  return {
    authorized: true as const,
    user,
    profile,
    supabase,
  };
}
