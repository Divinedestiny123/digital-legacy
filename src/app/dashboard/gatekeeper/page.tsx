"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/components/UserProvider";
import { KeyRound, CheckCircle2, Loader2, Save } from "lucide-react";
import toast from "react-hot-toast";

export default function GatekeeperSettingsPage() {
  const { user } = useUser();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChallenge, setHasChallenge] = useState(false);

  useEffect(() => {
    if (user) {
      fetch(`/api/gatekeeper?user_id=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.question) {
            setQuestion(data.question);
            setHasChallenge(true);
          }
          if (data.answer) setAnswer(data.answer);
        })
        .finally(() => setIsLoading(false));
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);

    try {
      const res = await fetch("/api/gatekeeper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          question,
          answer
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save gatekeeper settings");
      }
      setHasChallenge(true);
      toast.success("Gatekeeper challenge updated!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error saving settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-foreground/50" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-light tracking-tight text-foreground flex items-center gap-3">
            <KeyRound className="w-8 h-8" />
            Gatekeeper Challenge
          </h1>
          {hasChallenge && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-500 text-xs font-medium rounded-full border border-green-500/20">
              <CheckCircle2 className="w-4 h-4" />
              Active Challenge Set
            </span>
          )}
        </div>
        <p className="text-sm font-light text-muted-foreground mt-2 leading-relaxed">
          Define the ultimate security question that your AI will use to verify a claimant's identity. 
          The AI will evaluate the claimant's answer based on meaning, so they don't need to match your exact words.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">The Question</label>
            <input
              required
              className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
              placeholder="e.g. Where did we hide the time capsule in the summer of '99?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Expected Meaning / Answer</label>
            <textarea
              required
              className="w-full h-32 bg-background/50 border border-border rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all resize-none"
              placeholder="e.g. Under the old oak tree behind grandma's house."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              The AI will read this expected answer and judge if the claimant's response conceptually matches it.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={!question.trim() || !answer.trim() || isSaving}
          className="w-full flex items-center justify-center gap-2 bg-foreground text-background rounded-xl px-4 py-4 text-sm font-medium hover:bg-muted-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {hasChallenge ? "Update Challenge" : "Save Challenge"}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
