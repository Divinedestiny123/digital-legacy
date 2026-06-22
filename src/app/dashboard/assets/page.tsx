"use client";

import { useState, useEffect } from "react";
import { Shield, KeyRound, Loader2, FileText, CheckCircle2, CheckCircle, Lock } from "lucide-react";
import { encryptBlob } from "@/lib/crypto";
import { uploadTo0GStorage } from "@/lib/zeroGStorage";
import { useUser } from "@/components/UserProvider";

export default function AssetVaultPage() {
  const [seedPhrase, setSeedPhrase] = useState("");
  const [assetName, setAssetName] = useState("");
  const [claimantEmail, setClaimantEmail] = useState("");
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isSecured, setIsSecured] = useState(false);
  const [rootHash, setRootHash] = useState("");
  const [securedAssets, setSecuredAssets] = useState<any[]>([]);
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      fetch(`/api/assets?user_id=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.assets) {
            setSecuredAssets(data.assets.filter((a: any) => a.asset_type === 'seed_phrase'));
          }
        })
        .catch(err => console.error("Failed to fetch secured assets:", err));
    }
  }, [user, isSecured]);

  const handleSecureAssets = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seedPhrase.trim() || !user) return;
    setIsEncrypting(true);
    
    try {
      // 1. Convert seed phrase to a blob
      const textBlob = new Blob([seedPhrase], { type: 'text/plain' });
      
      // 2. Encrypt the blob locally using the standardized demo key
      const encryptedBlob = await encryptBlob(textBlob, "secret-key-placeholder");
      
      // 3. Upload the encrypted ciphertext to 0G Storage
      const hash = await uploadTo0GStorage(encryptedBlob);
      setRootHash(hash);

      // 4. Save to DB
      await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          asset_name: assetName || "Unnamed Asset",
          asset_type: 'seed_phrase',
          root_hash: hash
        })
      });
      
      setIsSecured(true);
    } catch (error) {
      console.error("Failed to secure assets:", error);
    } finally {
      setIsEncrypting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-light tracking-tight text-foreground">Asset Vault</h1>
        <p className="text-sm font-light text-muted-foreground mt-2 leading-relaxed">
          Secure your digital assets. Your data will be encrypted client-side and stored on the decentralized 0G network. It acts as an on-chain deadman's switch, revealed only to your authorized claimant after passing the AI verification.
        </p>
      </div>

      {isSecured ? (
        <div className="glass-panel p-8 rounded-3xl text-center space-y-4 animate-in fade-in zoom-in duration-500">
          <div className="mx-auto w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-foreground" />
          </div>
          <h2 className="text-2xl font-light text-foreground">Vault Locked</h2>
          <p className="text-muted-foreground text-sm font-light">
            Your assets are encrypted and stored safely on 0G. They will be revealed to <span className="font-medium text-foreground">{claimantEmail}</span> if they pass the Gatekeeper challenge.
          </p>
          <div className="mt-4 p-3 bg-black/30 rounded-xl border border-white/5 break-all">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">0G Storage Hash</p>
            <p className="text-xs font-mono text-foreground">{rootHash}</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSecureAssets} className="space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                Crypto Seed Phrase (or private text)
              </label>
              <textarea
                required
                className="w-full h-32 bg-background/50 border border-border rounded-xl p-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all resize-none font-mono text-sm"
                placeholder="Enter 12 or 24 words..."
                value={seedPhrase}
                onChange={(e) => setSeedPhrase(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Asset Name</label>
              <input
                required
                type="text"
                className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                placeholder="e.g. My MetaMask Wallet"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Authorized Claimant Identifier</label>
              <input
                required
                type="text"
                className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                placeholder="Relative's email or name"
                value={claimantEmail}
                onChange={(e) => setClaimantEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The AI will use this to identify who is attempting to claim the assets.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={!seedPhrase.trim() || !claimantEmail.trim() || !assetName.trim() || isEncrypting}
            className="w-full flex items-center justify-center gap-2 bg-foreground text-background rounded-xl px-4 py-4 text-sm font-medium hover:bg-muted-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEncrypting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Encrypting & Storing to 0G...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Lock Vault
              </>
            )}
          </button>
        </form>
      )}

      {securedAssets.length > 0 && (
        <div className="mt-12 space-y-4">
          <h3 className="text-sm font-medium text-foreground uppercase tracking-widest px-2">Your Secured Vault</h3>
          <div className="space-y-3">
            {securedAssets.map((asset) => (
              <div key={asset.id} className="glass-panel p-4 rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 bg-muted/30 rounded-full flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4 text-foreground/70" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{asset.asset_name}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5" title={asset.root_hash}>
                    Hash: <span className="font-mono">{asset.root_hash.substring(0, 16)}...</span>
                  </p>
                </div>
                <div className="text-xs text-muted-foreground/50 shrink-0">
                  {new Date(asset.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
