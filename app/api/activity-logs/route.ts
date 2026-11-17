import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/require-super-admin";


export async function GET(request: Request) {
  const auth = await requireSuperAdmin();

  if (!auth.authorized) {
    return NextResponse.json(
      { message: auth.message },
      { status: auth.status },
    );
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await auth.supabase
    .from("activity_logs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({
    logs: data ?? [],
    page,
    pageSize,
    total: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  });
}
