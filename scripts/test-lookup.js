const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
  const { data, error } = await supabase.rpc("get_user_id_by_email", {
    creator_email: "test@idontexist.com"
  });
  console.log("DATA:", data, typeof data);
  console.log("ERROR:", error);
}

test();
