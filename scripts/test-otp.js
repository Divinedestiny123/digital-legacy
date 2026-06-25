const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testAuth() {
  console.log("Attempting OTP for test@faketest123.com...");
  const { data, error } = await supabase.auth.signInWithOtp({
    email: "test@faketest123.com",
    options: {
      shouldCreateUser: true,
    },
  });

  console.log("DATA:", data);
  console.log("ERROR:", error);
  if (error) {
    console.log("ERROR JSON:", JSON.stringify(error));
  }
}

testAuth();
