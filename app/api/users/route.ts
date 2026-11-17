import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireSuperAdmin } from "@/lib/require-super-admin";


const MAX_PIC = 5;

export async function GET() {
  const auth = await requireSuperAdmin();

  if (!auth.authorized) {
    return NextResponse.json(
      { message: auth.message },
      { status: auth.status },
    );
  }

  const { data, error } = await auth.supabase
    .from("user_profiles")
    .select("user_id, full_name, email, role, is_active, created_at")
    .eq("role", "ADMIN_PIC")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({
    users: data ?? [],
    maxPic: MAX_PIC,
  });
}

export async function POST(request: Request) {
  const auth = await requireSuperAdmin();

  if (!auth.authorized) {
    return NextResponse.json(
      { message: auth.message },
      { status: auth.status },
    );
  }

  try {
    const body = await request.json();

    const fullName =
      typeof body.full_name === "string" ? body.full_name.trim() : "";

    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    const password = typeof body.password === "string" ? body.password : "";

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { message: "Nama, email, dan password wajib diisi." },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { message: "Format email tidak valid." },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password minimal 8 karakter." },
        { status: 400 },
      );
    }

    const { count, error: countError } = await supabaseAdmin
      .from("user_profiles")
      .select("user_id", { count: "exact", head: true })
      .eq("role", "ADMIN_PIC");

    if (countError) {
      return NextResponse.json(
        { message: countError.message },
        { status: 500 },
      );
    }

    if ((count ?? 0) >= MAX_PIC) {
      return NextResponse.json(
        { message: "Maksimal 5 akun PIC sudah tercapai." },
        { status: 409 },
      );
    }

    const { data: created, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          role: "ADMIN_PIC",
        },
      });

    if (createError || !created.user) {
      return NextResponse.json(
        { message: createError?.message ?? "Gagal membuat akun." },
        { status: 400 },
      );
    }

    const { error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .insert({
        user_id: created.user.id,
        full_name: fullName,
        email,
        role: "ADMIN_PIC",
        is_active: true,
      });

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(created.user.id);

      return NextResponse.json(
        { message: profileError.message },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        message: "Akun PIC berhasil dibuat.",
        user: {
          user_id: created.user.id,
          full_name: fullName,
          email,
          role: "ADMIN_PIC",
          is_active: true,
        },
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { message: "Permintaan tidak valid." },
      { status: 400 },
    );
  }
}
