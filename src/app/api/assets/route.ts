import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { user_id, asset_name, asset_type, root_hash } = await req.json();

    if (!user_id || !asset_name || !asset_type || !root_hash) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await supabase.from('user_assets').insert({
      user_id,
      asset_name,
      asset_type,
      root_hash
    });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Asset Insert Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");

    if (!user_id) {
      return NextResponse.json({ error: "user_id is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('user_assets')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ assets: data });
  } catch (error: any) {
    console.error("Asset Fetch Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
