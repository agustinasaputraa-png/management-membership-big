import { supabase } from "./supabase";

export async function testSupabaseConnection() {
  const { error } = await supabase
    .from("members")
    .select("id")
    .limit(1);

  if (error) {
    console.error("SUPABASE CONNECTION ERROR:", error.message);
    return false;
  }

  console.log("SUPABASE DATABASE CONNECTION SUCCESS");
  return true;
}
