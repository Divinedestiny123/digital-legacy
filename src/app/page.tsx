import Link from "next/link";
import { ArrowRight, KeyRound, Brain, Shield, Database, Fingerprint, Lock, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-muted selection:text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/50 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
              <Brain className="h-5 w-5" />
            </div>
            <span className="text-lg font-medium tracking-tight">DigitalLegacy</span>
          </div>
          <div className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</a>
            <a href="#security" className="hover:text-foreground transition-colors">Security</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-muted-foreground transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex flex-col">
        {/* Hero Section */}
        <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden pt-20">
          <div className="absolute top-1/4 left-1/4 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/20 blur-[150px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 h-[600px] w-[600px] translate-x-1/2 translate-y-1/2 rounded-full bg-muted/30 blur-[150px] pointer-events-none" />

          <div className="z-10 flex flex-col items-center space-y-10 text-center px-4 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-muted-foreground">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              Powered by 0G Network & pgvector
            </div>
            
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-light tracking-tighter text-foreground leading-[1.1]">
              Your mind.<br />
              <span className="text-muted-foreground">Your legacy.</span><br />
              Forever.
            </h1>
            
            <p className="max-w-[600px] text-lg sm:text-xl font-light text-muted-foreground leading-relaxed">
              A decentralized AI companion trained on your memories, securing your encrypted assets until the time is right. Give your loved ones the ultimate gift: a final conversation.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl justify-center mt-12">
              <Link
                href="/login"
                className="group relative flex flex-1 items-center justify-center gap-3 rounded-full bg-foreground px-8 py-5 text-base font-medium text-background transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
              >
                Start Preserving
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              
              <Link
                href="/claim"
                className="group glass-panel flex flex-1 items-center justify-center gap-3 rounded-full px-8 py-5 text-base font-medium text-foreground transition-all duration-300 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] border border-white/10"
              >
                Talk to a loved one
                <KeyRound className="h-5 w-5 transition-transform duration-300 group-hover:-rotate-12" />
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 sm:py-32 relative border-t border-white/5 bg-background">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-light tracking-tight sm:text-4xl">Built for immortality.</h2>
              <p className="mt-4 text-lg font-light text-muted-foreground">
                Cutting-edge decentralized storage combined with semantic AI verification.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="glass-panel p-8 rounded-3xl space-y-4 hover:bg-white/5 transition-colors">
                <div className="h-12 w-12 bg-muted rounded-2xl flex items-center justify-center">
                  <Database className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="text-xl font-medium">Decentralized Vault</h3>
                <p className="text-muted-foreground font-light text-sm leading-relaxed">
                  Your most precious digital assets and final videos are encrypted and uploaded to the 0G Storage Network. No central server controls your legacy.
                </p>
              </div>

              <div className="glass-panel p-8 rounded-3xl space-y-4 hover:bg-white/5 transition-colors relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Fingerprint className="h-32 w-32" />
                </div>
                <div className="h-12 w-12 bg-muted rounded-2xl flex items-center justify-center relative z-10">
                  <Brain className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="text-xl font-medium relative z-10">Persona Continuation</h3>
                <p className="text-muted-foreground font-light text-sm leading-relaxed relative z-10">
                  We don't just store text. We train an AI on your cadence, humor, and worldview. Your loved ones can chat with a digital reflection of you.
                </p>
              </div>

              <div className="glass-panel p-8 rounded-3xl space-y-4 hover:bg-white/5 transition-colors">
                <div className="h-12 w-12 bg-muted rounded-2xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="text-xl font-medium">AI Gatekeeper</h3>
                <p className="text-muted-foreground font-light text-sm leading-relaxed">
                  Protect your assets with conversational Multi-Factor Authentication. The AI verifies the claimant's identity by analyzing the meaning of their answers to your secret questions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="py-24 sm:py-32 bg-muted/30 border-t border-white/5">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <h2 className="text-3xl font-light tracking-tight sm:text-5xl leading-tight">
                  Three steps to secure your digital footprint.
                </h2>
                <p className="text-lg font-light text-muted-foreground">
                  Setting up your legacy is as simple as having a conversation. Our AI guides you through everything.
                </p>
                
                <div className="space-y-6 pt-4">
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background font-bold">1</div>
                    <div>
                      <h4 className="text-lg font-medium">Train your AI</h4>
                      <p className="text-sm font-light text-muted-foreground mt-1">Chat with our system in the Creator Dashboard to capture your memories and tone.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background font-bold">2</div>
                    <div>
                      <h4 className="text-lg font-medium">Secure your Assets</h4>
                      <p className="text-sm font-light text-muted-foreground mt-1">Upload your seed phrases and record a final video. We encrypt it all locally.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background font-bold">3</div>
                    <div>
                      <h4 className="text-lg font-medium">Set the Gatekeeper</h4>
                      <p className="text-sm font-light text-muted-foreground mt-1">Define a secret memory. The AI will test your claimant before unlocking the vault.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-panel p-8 rounded-3xl aspect-square flex flex-col justify-center items-center relative overflow-hidden">
                 {/* Abstract visual representation */}
                 <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent pointer-events-none" />
                 <Lock className="h-24 w-24 text-foreground/80 mb-6" />
                 <h3 className="text-2xl font-light text-foreground text-center px-8">Client-side encryption ensures we never see your keys.</h3>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">DigitalLegacy</span>
          </div>
          <p className="text-sm font-light text-muted-foreground">
            © 2026 Digital Legacy Protocol. Built on 0G Network.
          </p>
        </div>
      </footer>
    </div>
  );
}
