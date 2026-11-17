import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("user_id, full_name, email, role, is_active")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !profile || !profile.is_active) {
    return NextResponse.json(
      { message: "Profil tidak aktif atau tidak ditemukan." },
      { status: 403 },
    );
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role,
      is_active: profile.is_active,
    },
  });
}
