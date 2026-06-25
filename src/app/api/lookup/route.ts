import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// We can use the anon key since we made it a SECURITY DEFINER function.
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  try {
    const { data, error } = await supabase.rpc("get_user_id_by_email", {
      creator_email: email.trim().toLowerCase()
    });

    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Creator not found" }, { status: 404 });

    return NextResponse.json({ user_id: data });
  } catch (error: any) {
    console.error("Lookup error:", error);
    const errorMessage = error?.message || (typeof error === 'string' ? error : "An unexpected server error occurred during lookup");
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
