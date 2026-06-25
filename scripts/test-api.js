const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function mockApiRoute() {
  const email = "random@test.com";
  try {
    const { data, error } = await supabase.rpc("get_user_id_by_email", {
      creator_email: email.trim().toLowerCase()
    });

    console.log("RPC Data:", data);
    console.log("RPC Error:", error);

    if (error) {
      console.log("Response:", { error: error.message }, "Status:", 500);
      return;
    }
    if (!data) {
      console.log("Response:", { error: "Creator not found" }, "Status:", 404);
      return;
    }

    console.log("Response:", { user_id: data }, "Status:", 200);
  } catch (error) {
    console.log("Response:", { error: error.message }, "Status:", 500);
  }
}

mockApiRoute();
