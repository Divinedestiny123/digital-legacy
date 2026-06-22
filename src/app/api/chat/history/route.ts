import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");
    const phase = searchParams.get("phase");

    if (!user_id || !phase) {
      return NextResponse.json({ error: "user_id and phase are required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("chat_messages")
      .select("id, role, content")
      .eq("user_id", user_id)
      .eq("phase", phase)
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    // Convert UUID string IDs to string ids expected by the UI if needed
    const formattedData = data.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content
    }));

    return NextResponse.json({ messages: formattedData });
  } catch (error: any) {
    console.error("Fetch History Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch history" },
      { status: 500 }
    );
  }
}
