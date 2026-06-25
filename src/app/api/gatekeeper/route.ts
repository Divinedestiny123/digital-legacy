import { NextResponse } from "next/server";
import { generateEmbedding } from "@/lib/embeddings";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("user_id");

  if (!userId) return NextResponse.json({ error: "user_id required" }, { status: 400 });

  // Get the most recent gatekeeper challenge
  const { data, error } = await supabase
    .from("memories")
    .select("content_chunk, metadata")
    .eq("user_id", userId)
    .eq("context_type", "gatekeeper_challenge")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") { // PGRST116 is no rows returned
    const errorMessage = error?.message || "An unexpected database error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }

  if (data) {
    const parsedMetadata = typeof data.metadata === 'string' ? JSON.parse(data.metadata) : (data.metadata || {});
    return NextResponse.json({
      question: data.content_chunk,
      answer: parsedMetadata.expected_answer || ""
    });
  }

  return NextResponse.json({ question: "", answer: "" });
}

export async function POST(req: Request) {
  try {
    const { user_id, question, answer } = await req.json();

    if (!user_id || !question || !answer) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Generate embedding for the question so it's technically a valid memory
    const embedding = await generateEmbedding(question);

    // We store the question in content, and answer in metadata.
    // First, let's delete any old gatekeeper challenges to keep it clean (optional, but good for 1:1 relationship)
    await supabase
      .from("memories")
      .delete()
      .eq("user_id", user_id)
      .eq("context_type", "gatekeeper_challenge");

    // Insert new challenge
    const { error } = await supabase
      .from("memories")
      .insert({
        user_id,
        content_chunk: question,
        embedding,
        context_type: "gatekeeper_challenge",
        metadata: { expected_answer: answer }
      });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Gatekeeper API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
