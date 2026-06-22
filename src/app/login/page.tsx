"use client";

import { useState } from "react";
import { ArrowRight, Mail, Loader2, Sparkles, KeyRound } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [step, setStep] = useState<"EMAIL" | "OTP">("EMAIL");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) throw error;
      setStep("OTP");
    } catch (err: any) {
      setError(err.message || "Failed to send code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      });

      if (error) throw error;
      if (data.session) {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Invalid code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 bg-background overflow-hidden">
      <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/20 blur-[100px] pointer-events-none" />

      <div className="z-10 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 space-y-8">
          
          {step === "EMAIL" ? (
            <>
              <div className="space-y-3 text-center">
                <div className="mx-auto w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center mb-6">
                  <Sparkles className="w-5 h-5 text-foreground" />
                </div>
                <h1 className="text-3xl font-light tracking-tight text-foreground">Welcome Back</h1>
                <p className="text-sm font-light text-muted-foreground">
                  Enter your email to receive a secure login code.
                </p>
              </div>

              <form onSubmit={handleSendOTP} className="space-y-6">
                <div className="space-y-2">
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                  />
                </div>

                {error && <p className="text-red-500 text-xs text-center font-medium">{error}</p>}

                <button
                  type="submit"
                  disabled={!email.trim() || isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-foreground text-background rounded-xl px-4 py-3 text-sm font-medium hover:bg-muted-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                    <>
                      Send Code <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="space-y-3 text-center">
                <div className="mx-auto w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center mb-6">
                  <KeyRound className="w-5 h-5 text-foreground" />
                </div>
                <h1 className="text-3xl font-light tracking-tight text-foreground">Enter Code</h1>
                <p className="text-sm font-light text-muted-foreground">
                  We've sent a secure code to <span className="font-medium text-foreground">{email}</span>.
                </p>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    placeholder="000000"
                    maxLength={8}
                    value={token}
                    onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] font-light text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                  />
                </div>

                {error && <p className="text-red-500 text-xs text-center font-medium">{error}</p>}

                <button
                  type="submit"
                  disabled={token.length < 6 || isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-foreground text-background rounded-xl px-4 py-3 text-sm font-medium hover:bg-muted-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Sign In"}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep("EMAIL"); setToken(""); setError(""); }}
                  className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-all"
                >
                  Use a different email
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
