import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireSuperAdmin } from "@/lib/require-super-admin";


type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireSuperAdmin();

  if (!auth.authorized) {
    return NextResponse.json(
      { message: auth.message },
      { status: auth.status },
    );
  }

  const { id } = await context.params;

  if (id === auth.user.id) {
    return NextResponse.json(
      { message: "Tidak dapat mengubah akun sendiri melalui menu PIC." },
      { status: 400 },
    );
  }

  try {
    const body = await request.json();

    const { data: target, error: targetError } = await supabaseAdmin
      .from("user_profiles")
      .select("user_id, role")
      .eq("user_id", id)
      .maybeSingle();

    if (targetError || !target || target.role !== "ADMIN_PIC") {
      return NextResponse.json(
        { message: "Akun PIC tidak ditemukan." },
        { status: 404 },
      );
    }

    const updates: {
      full_name?: string;
      email?: string;
      is_active?: boolean;
    } = {};

    if (typeof body.full_name === "string") {
      const fullName = body.full_name.trim();

      if (!fullName) {
        return NextResponse.json(
          { message: "Nama tidak boleh kosong." },
          { status: 400 },
        );
      }

      updates.full_name = fullName;
    }

    if (typeof body.email === "string") {
      const email = body.email.trim().toLowerCase();

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json(
          { message: "Format email tidak valid." },
          { status: 400 },
        );
      }

      updates.email = email;
    }

    if (typeof body.is_active === "boolean") {
      updates.is_active = body.is_active;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { message: "Tidak ada perubahan yang dikirim." },
        { status: 400 },
      );
    }

    const authUpdates: {
      email?: string;
      user_metadata?: { full_name: string };
      ban_duration?: string;
    } = {};

    if (updates.email) authUpdates.email = updates.email;

    if (updates.full_name) {
      authUpdates.user_metadata = {
        full_name: updates.full_name,
      };
    }

    if (updates.is_active !== undefined) {
      authUpdates.ban_duration = updates.is_active ? "none" : "876000h";
    }

    const { error: authUpdateError } =
      await supabaseAdmin.auth.admin.updateUserById(id, authUpdates);

    if (authUpdateError) {
      return NextResponse.json(
        { message: authUpdateError.message },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("user_profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", id)
      .select("user_id, full_name, email, role, is_active")
      .single();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "Data PIC berhasil diperbarui.",
      user: data,
    });
  } catch {
    return NextResponse.json(
      { message: "Permintaan tidak valid." },
      { status: 400 },
    );
  }
}
