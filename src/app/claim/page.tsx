"use client";

import { useState, useEffect } from "react";
import ChatInterface, { Message } from "@/components/ChatInterface";
import { Play, FileText, LockOpen, Loader2, ArrowRight, ArrowLeft, X, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { decryptBlob } from "@/lib/crypto";
import { useRouter } from "next/navigation";

export default function ClaimPage() {
  const router = useRouter();
  
  // Base State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "sys-1",
      role: "system",
      content: "You are the digital continuation of the creator. Chat with your loved one."
    },
    {
      id: "msg-1",
      role: "assistant",
      content: "Hey... it's me. It's been a while. I'm so glad you're here. What's on your mind?"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [vaultStatus, setVaultStatus] = useState<"entry" | "hidden" | "challenge" | "unlocked">("entry");
  const [unlockedAssets, setUnlockedAssets] = useState<any[]>([]);
  const [creatorEmail, setCreatorEmail] = useState("");
  const [creatorId, setCreatorId] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [decryptedVideoUrls, setDecryptedVideoUrls] = useState<Record<string, string>>({});
  const [isDecryptingVideo, setIsDecryptingVideo] = useState<Record<string, boolean>>({});
  const [decryptedTextAssets, setDecryptedTextAssets] = useState<Record<string, string>>({});
  const [isDecryptingText, setIsDecryptingText] = useState<Record<string, boolean>>({});
  const [isMobileVaultOpen, setIsMobileVaultOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from session storage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem("digital_legacy_claim_state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.messages) setMessages(parsed.messages);
        if (parsed.vaultStatus) setVaultStatus(parsed.vaultStatus);
        if (parsed.isUnlocked !== undefined) setIsUnlocked(parsed.isUnlocked);
        if (parsed.creatorId) setCreatorId(parsed.creatorId);
        if (parsed.creatorEmail) setCreatorEmail(parsed.creatorEmail);
      } catch (e) {
        console.error("Failed to parse session state", e);
      }
    }
    setIsHydrated(true);
  }, []);

  // Save to session storage when state changes
  useEffect(() => {
    if (isHydrated) {
      sessionStorage.setItem("digital_legacy_claim_state", JSON.stringify({
        messages,
        vaultStatus,
        isUnlocked,
        creatorId,
        creatorEmail
      }));
    }
  }, [messages, vaultStatus, isUnlocked, creatorId, creatorEmail, isHydrated]);

  useEffect(() => {
    if (isUnlocked && creatorId) {
      fetch(`/api/assets?user_id=${creatorId}`, { cache: 'no-store' })
        .then(res => res.json())
        .then(data => {
          if (data.assets) setUnlockedAssets(data.assets);
        })
        .catch(err => console.error("Failed to fetch assets", err));
    }
  }, [isUnlocked, creatorId]);

  const handleSendMessage = async (content: string) => {
    const newUserMsg: Message = { id: Date.now().toString(), role: "user", content };
    setMessages((prev) => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      if (vaultStatus === "challenge") {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, newUserMsg],
            phase: "GATEKEEPER",
            user_id: creatorId
          }),
        });
        const data = await response.json();
        
        try {
          const parsed = JSON.parse(data.content);
          if (parsed.unlocked) {
            setMessages((prev) => [...prev, {
              id: Date.now().toString(),
              role: "assistant",
              content: "That's exactly right. I knew you'd remember. I'm unlocking the vault for you now."
            }]);
            setVaultStatus("unlocked");
            setIsUnlocked(true);
            setIsMobileVaultOpen(true); // Auto-open vault on mobile when unlocked
          }
        } catch (e) {
          // If it wasn't the JSON payload, it means it's a hint
          setMessages((prev) => [...prev, {
            id: Date.now().toString(),
            role: "assistant",
            content: data.content
          }]);
        }
        setIsLoading(false);
        return;
      }

      // Normal chat flow
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, newUserMsg],
          phase: "CLAIMANT",
          user_id: creatorId
        }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: data.content
      }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: "I'm having trouble connecting to the network..."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerGatekeeper = async () => {
    setVaultStatus("challenge");
    try {
      const res = await fetch(`/api/gatekeeper?user_id=${creatorId}`);
      const data = await res.json();
      const question = data.question || "Before I show you what I left behind, I need to make sure it's really you. What is a specific memory we shared that no one else knows?";
      
      setMessages(prev => [
        ...prev, 
        { 
          id: Date.now().toString(), 
          role: "assistant", 
          content: question 
        }
      ]);
    } catch (e) {
      setMessages(prev => [
        ...prev, 
        { 
          id: Date.now().toString(), 
          role: "assistant", 
          content: "Before I show you what I left behind, I need to make sure it's really you." 
        }
      ]);
    }
  };

  const handleLookupEmail = async () => {
    if (!creatorEmail.trim()) return;
    setIsLookingUp(true);
    try {
      const res = await fetch(`/api/lookup?email=${encodeURIComponent(creatorEmail)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to find creator");
      
      setCreatorId(data.user_id);
      setVaultStatus("hidden");
      toast.success("Creator Found");
    } catch (err: any) {
      toast.error(err.message || "Creator not found");
    } finally {
      setIsLookingUp(false);
    }
  };

  const handlePlayVideo = async (hash: string) => {
    if (decryptedVideoUrls[hash] || isDecryptingVideo[hash]) return;
    
    setIsDecryptingVideo(prev => ({ ...prev, [hash]: true }));
    try {
      let encryptedBlob: Blob;
      
      if (hash.startsWith("base64:")) {
        // Handle serverless deployment fallback
        const base64Data = hash.split("base64:")[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        encryptedBlob = new Blob([byteArray], { type: "application/octet-stream" });
      } else {
        // Handle local filesystem fallback
        const res = await fetch(`/uploads/${hash}.bin`);
        if (!res.ok) throw new Error("Video file not found. It may have been dropped by the testnet or not saved locally.");
        encryptedBlob = await res.blob();
      }
      
      const decryptedBlob = await decryptBlob(encryptedBlob, "secret-key-placeholder");
      const url = URL.createObjectURL(decryptedBlob);
      
      setDecryptedVideoUrls(prev => ({ ...prev, [hash]: url }));
    } catch (err: any) {
      toast.error(err.message || "Failed to decrypt video");
      console.error(err);
    } finally {
      setIsDecryptingVideo(prev => ({ ...prev, [hash]: false }));
    }
  };

  const handleDecryptText = async (hash: string) => {
    if (decryptedTextAssets[hash] || isDecryptingText[hash]) return;
    
    setIsDecryptingText(prev => ({ ...prev, [hash]: true }));
    try {
      let encryptedBlob: Blob;
      
      if (hash.startsWith("base64:")) {
        const base64Data = hash.split("base64:")[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        encryptedBlob = new Blob([byteArray], { type: "application/octet-stream" });
      } else {
        const res = await fetch(`/uploads/${hash}.bin`);
        if (!res.ok) {
          // Fallback for assets created before the local .bin backup feature was added
          console.warn("Asset not found locally. Providing fallback demo text.");
          setDecryptedTextAssets(prev => ({ ...prev, [hash]: "[System Notice: The local encrypted backup for this specific asset was not found on the server. Please create a new asset in the Creator Dashboard to see real data.]" }));
          return;
        }
        encryptedBlob = await res.blob();
      }
      
      const decryptedBlob = await decryptBlob(encryptedBlob, "secret-key-placeholder");
      const text = await decryptedBlob.text();
      
      setDecryptedTextAssets(prev => ({ ...prev, [hash]: text }));
    } catch (err: any) {
      toast.error("Failed to decrypt asset");
      console.error(err);
    } finally {
      setIsDecryptingText(prev => ({ ...prev, [hash]: false }));
    }
  };

  return (
    <main className="relative flex flex-col lg:flex-row h-[100dvh] bg-background overflow-hidden">
      {/* Liquid Mesh Background */}
      <div className="absolute inset-0 liquid-mesh opacity-60 mix-blend-screen pointer-events-none filter blur-[80px]" />

      {/* Main Chat Area */}
        {vaultStatus === "entry" && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500 relative">
            <button 
              onClick={() => router.push('/')}
              className="absolute top-8 left-8 text-sm font-medium text-muted-foreground hover:text-foreground transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
            <div className="glass-panel p-8 sm:p-12 rounded-3xl max-w-md w-full space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <LockOpen className="w-32 h-32" />
              </div>
              <h2 className="text-2xl font-light text-foreground tracking-tight">Access Portal</h2>
              <p className="text-sm font-light text-muted-foreground">
                Please enter the Creator's email to request access to their Digital Legacy.
              </p>
              
              <div className="space-y-4 text-left relative z-10">
                <input
                  type="email"
                  placeholder="Creator's Email Address..."
                  className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                  value={creatorEmail}
                  onChange={(e) => setCreatorEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLookupEmail()}
                />
                
                <button
                  onClick={handleLookupEmail}
                  disabled={!creatorEmail.trim() || isLookingUp}
                  className="w-full flex items-center justify-center gap-2 bg-foreground text-background rounded-xl px-4 py-3 text-sm font-medium hover:bg-muted-foreground transition-all disabled:opacity-50"
                >
                  {isLookingUp ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Looking up...</>
                  ) : (
                    <><ArrowRight className="w-4 h-4" /> Enter Portal</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {vaultStatus !== "entry" && (
          <div className="flex-1 flex flex-col min-h-0 z-10">
            <div className="p-4 sm:p-6 border-b border-border bg-background/50 backdrop-blur-md flex flex-col items-start gap-4 relative shrink-0">
              <button 
                onClick={() => router.push('/')}
                className="absolute top-6 right-6 text-sm font-medium text-muted-foreground hover:text-foreground transition-all flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Exit Portal
              </button>
              
              <div>
                <h1 className="text-xl font-medium tracking-tight text-foreground">Digital Continuation</h1>
                <p className="text-xs font-light text-green-500 flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Online
                </p>
              </div>
              
              {!isUnlocked && vaultStatus === "hidden" && (
                <button 
                  onClick={triggerGatekeeper}
                  className="text-xs font-medium bg-foreground text-background px-4 py-2 rounded-full hover:bg-muted-foreground transition-all flex items-center gap-2 shadow-lg"
                >
                  <LockOpen className="w-3 h-3" />
                  Request Vault Access
                </button>
              )}
            </div>
            
            <div className="flex-1 p-4 sm:p-8 min-h-0 overflow-hidden flex flex-col relative">
              <ChatInterface 
                messages={messages} 
                onSendMessage={handleSendMessage} 
                isLoading={isLoading} 
              />
              {/* Floating Action Button for Mobile Vault */}
              {isUnlocked && (
                <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20 lg:hidden pointer-events-none">
                  <button 
                    onClick={() => setIsMobileVaultOpen(true)}
                    className="bg-foreground text-background px-6 py-3 rounded-full flex items-center gap-2 shadow-2xl font-medium tracking-tight pointer-events-auto hover:scale-105 transition-transform"
                  >
                    <LockOpen className="w-4 h-4" />
                    View Unlocked Vault
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      {/* Revealed Vault Area */}
      {isUnlocked && (
        <aside className={`fixed inset-0 flex lg:static w-full lg:w-1/3 lg:h-full border-t lg:border-t-0 lg:border-l border-border bg-background/95 lg:bg-background/50 backdrop-blur-2xl flex-col z-50 lg:z-20 shrink-0 transition-transform duration-500 ease-out ${isMobileVaultOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}`}>
          <div className="p-6 border-b border-border flex items-center justify-between gap-3 shrink-0 bg-background/90 backdrop-blur-md z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-foreground text-background rounded-full flex items-center justify-center">
                <LockOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-foreground">The Vault</h2>
                <p className="text-xs text-muted-foreground">Decrypted via 0G Storage</p>
              </div>
            </div>
            <button 
              onClick={() => setIsMobileVaultOpen(false)}
              className="lg:hidden p-2 rounded-full bg-white/10 text-muted-foreground hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-8 flex-1 min-h-0 overflow-y-auto pb-32 lg:pb-6 relative z-0">
            {unlockedAssets.map(asset => (
              <div key={asset.id} className="space-y-4">
                <h3 className="text-sm font-medium text-foreground uppercase tracking-widest">{asset.asset_type === 'video_message' ? 'Media Message' : 'Secured Asset'}</h3>
                
                {asset.asset_type === 'video_message' ? (
                  <div 
                    onClick={() => handlePlayVideo(asset.root_hash)}
                    className="w-full aspect-video bg-black rounded-2xl flex flex-col items-center justify-center group cursor-pointer relative overflow-hidden"
                  >
                    {decryptedVideoUrls[asset.root_hash] ? (
                      <video 
                        src={decryptedVideoUrls[asset.root_hash]} 
                        autoPlay 
                        controls 
                        className="w-full h-full object-cover absolute inset-0 z-10"
                      />
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-accent/20 group-hover:bg-accent/40 transition-all" />
                        {isDecryptingVideo[asset.root_hash] ? (
                          <div className="flex flex-col items-center gap-2 z-10">
                            <Loader2 className="w-8 h-8 text-white animate-spin opacity-80" />
                            <span className="text-xs text-white/80 font-medium tracking-widest uppercase">Decrypting...</span>
                          </div>
                        ) : (
                          <Play className="w-12 h-12 text-white z-10 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                        )}
                        <p className="absolute bottom-4 left-4 text-xs font-medium text-white z-10">{asset.asset_name}</p>
                        <p className="absolute top-4 right-4 text-[10px] font-mono text-white/50 z-10 max-w-[150px] truncate" title={asset.root_hash}>{asset.root_hash}</p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="glass-panel p-4 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{asset.asset_name}</p>
                          <p className="text-xs text-muted-foreground">Secured text asset</p>
                        </div>
                      </div>
                      {!decryptedTextAssets[asset.root_hash] && (
                        <button 
                          onClick={() => handleDecryptText(asset.root_hash)}
                          disabled={isDecryptingText[asset.root_hash]}
                          className="text-xs bg-foreground text-background px-3 py-1.5 rounded-full font-medium shrink-0 disabled:opacity-50 flex items-center gap-1.5 hover:scale-105 transition-transform"
                        >
                          {isDecryptingText[asset.root_hash] ? (
                            <><Loader2 className="w-3 h-3 animate-spin" /> Decrypting...</>
                          ) : (
                            <><LockOpen className="w-3 h-3" /> Decrypt</>
                          )}
                        </button>
                      )}
                    </div>
                    {decryptedTextAssets[asset.root_hash] ? (
                      <div className="bg-background/50 p-4 rounded-xl border border-border mt-3 animate-in fade-in zoom-in">
                        <p className="text-[10px] text-green-500 font-medium uppercase tracking-widest mb-2 flex items-center gap-2">
                           <LockOpen className="w-3 h-3" /> Decrypted successfully
                        </p>
                        <p className="font-mono text-sm text-foreground tracking-wider leading-relaxed whitespace-pre-wrap">
                          {decryptedTextAssets[asset.root_hash]}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-background/50 p-3 rounded-xl border border-border mt-3 opacity-50 flex items-center justify-between">
                         <p className="font-mono text-[10px] text-muted-foreground tracking-wider leading-relaxed break-all truncate" title={asset.root_hash}>
                           Encrypted Hash: {asset.root_hash}
                         </p>
                         <Lock className="w-3 h-3 text-muted-foreground ml-2 shrink-0" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            
            {unlockedAssets.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No assets found in vault.</p>
            )}
          </div>
        </aside>
      )}
    </main>
  );
}
