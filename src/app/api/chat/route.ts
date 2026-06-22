import { NextResponse } from "next/server";
import { createZGComputeNetworkBroker } from "@0gfoundation/0g-compute-ts-sdk";
import { ethers } from "ethers";
import OpenAI from "openai";
import { supabase } from "@/lib/supabaseClient";
import { generateEmbedding } from "@/lib/embeddings";

export async function POST(req: Request) {
  try {
    const { messages, phase, user_id } = await req.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "Messages are required" }, { status: 400 });
    }

    let systemPrompt = phase === "CLAIMANT" 
      ? "You are the digital continuation of the creator. Speak exactly in their tone based on the injected memories. Do not invent facts."
      : phase === "GATEKEEPER"
        ? "You are the Vault Gatekeeper. You will be provided with the creator's custom question and expected answer. Ask the claimant the question. Evaluate their response based on the intended meaning (it does not need to match exact words). If their response is conceptually correct, reply EXACTLY with '{\"unlocked\": true}'. If it is incorrect, reply naturally with a hint or ask them to try again."
        : "You are an AI capturing the essence of the user to build their digital legacy. Ask questions one at a time. Keep it conversational.";

    const lastMessage = messages[messages.length - 1];

    if (lastMessage && lastMessage.role === "user") {
      let embedding: number[] = [];
      try {
        embedding = await generateEmbedding(lastMessage.content);
      } catch (embError: any) {
        console.warn("Local Embedding Failed. Using zero vector fallback.", embError.message);
        embedding = Array(384).fill(0);
      }

      if (phase === "CLAIMANT") {
        // Retrieve relevant memories for the claimant
        const { data: memories, error } = await supabase.rpc('match_memories', {
          query_embedding: embedding,
          match_threshold: 0.3, // lowered threshold for Xenova miniLM
          match_count: 5,
          target_user_id: user_id
        });

        if (error) {
          console.error("Supabase RAG Match Error:", error);
        } else if (memories && memories.length > 0) {
          const contextText = memories.map((m: any) => m.content_chunk).join("\n\n");
          systemPrompt += `\n\n=== CREATOR MEMORIES ===\n${contextText}\n========================\nBase your response entirely on these memories.`;
        }
      } else if (phase === "TRAINING") {
        // Save the training memory
        const { error } = await supabase.from('memories').insert({
          user_id: user_id,
          content_chunk: lastMessage.content,
          context_type: "training_chat",
          embedding: embedding
        });

        if (error) {
          console.error("Supabase Memory Insert Error:", error);
        }
      } else if (phase === "GATEKEEPER") {
        // Fetch the custom gatekeeper challenge
        const { data: challenge, error: gkError } = await supabase
          .from('memories')
          .select('content_chunk, metadata')
          .eq('user_id', user_id)
          .eq('context_type', 'gatekeeper_challenge')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (!gkError && challenge) {
          const parsedMetadata = typeof challenge.metadata === 'string' ? JSON.parse(challenge.metadata) : (challenge.metadata || {});
          systemPrompt += `\n\n=== CREATOR'S CUSTOM CHALLENGE ===\nQuestion: ${challenge.content_chunk}\nExpected Answer: ${parsedMetadata.expected_answer}\n=======================\nUse this to evaluate the user.`;
        } else {
          systemPrompt += `\n\n=== CREATOR'S CUSTOM CHALLENGE ===\nQuestion: What is a specific memory we shared that no one else knows?\nExpected Answer: [Any highly specific memory]\n=======================\nUse this to evaluate the user.`;
        }
      }
      
      // Save user message to chat_messages history
      const { error: chatError } = await supabase.from('chat_messages').insert({
        user_id: user_id,
        role: "user",
        content: lastMessage.content,
        phase: phase
      });
      if (chatError) console.error("Error saving user message to history:", chatError);
    }

    // Ensure the system prompt is always at the top
    const formattedMessages = [
      { role: "system", content: systemPrompt },
      ...messages.filter((m: any) => m.role !== "system")
    ];

    // Initialize 0G Compute SDK
    const privateKey = process.env.PRIVATE_KEY;
    const providerAddress = process.env.NEXT_PUBLIC_COMPUTE_PROVIDER_ADDRESS;

    if (!privateKey || !providerAddress) {
      throw new Error("Missing 0G network configuration or provider address.");
    }

    const provider = new ethers.JsonRpcProvider("https://evmrpc-testnet.0g.ai");
    const wallet = new ethers.Wallet(privateKey, provider);
    const broker = await createZGComputeNetworkBroker(wallet);

    // Fetch the specific node's metadata
    const { endpoint, model } = await broker.inference.getServiceMetadata(providerAddress);
    
    // Generate the cryptographic payment headers for the payload
    // We pass a serialized string of the messages to generate the correct hash for the payload
    const payloadString = JSON.stringify({ messages: formattedMessages, model });
    const headers = await broker.inference.getRequestHeaders(providerAddress, payloadString);

    // Initialize standard OpenAI client with the 0G decentralized endpoint
    const openai = new OpenAI({
      baseURL: endpoint,
      apiKey: "0g-compute-auth", // We authenticate via cryptographic headers, not API key
    });

    // Make the inference request directly to the 0G Node
    const completion = await openai.chat.completions.create(
      {
        messages: formattedMessages,
        model,
      },
      { headers: { ...headers } as any }
    );

    const aiContent = completion.choices[0]?.message?.content || "I am currently disconnected from the computation network.";

    // Save the assistant message to chat_messages history
    const { error: assistantChatError } = await supabase.from('chat_messages').insert({
      user_id: user_id,
      role: "assistant",
      content: aiContent,
      phase: phase
    });
    if (assistantChatError) console.error("Error saving assistant message to history:", assistantChatError);

    return NextResponse.json({
      role: "assistant",
      content: aiContent,
    });

  } catch (error: any) {
    console.error("AI Route Error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred connecting to the AI node." },
      { status: 500 }
    );
  }
}
