"use client";

import { useState, useRef, useEffect } from "react";
import { Video, StopCircle, CheckCircle, Loader2 } from "lucide-react";
import { encryptBlob } from "@/lib/crypto";
import { uploadTo0GStorage } from "@/lib/zeroGStorage";
import { useUser } from "@/components/UserProvider";

export default function MediaVaultPage() {
  const { user } = useUser();
  const [isRecording, setIsRecording] = useState(false);
  const [mediaBlobUrl, setMediaBlobUrl] = useState<string | null>(null);
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);
  const [mediaTitle, setMediaTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSecured, setIsSecured] = useState(false);
  const [rootHash, setRootHash] = useState("");
  const [securedAssets, setSecuredAssets] = useState<any[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        setMediaBlob(blob);
        setMediaBlobUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing media devices.", err);
      alert("Could not access camera/microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadMedia = async () => {
    if (!mediaBlob || !user) return;
    setIsUploading(true);
    
    try {
      // 1. Encrypt the video blob locally
      const encryptedBlob = await encryptBlob(mediaBlob, "secret-key-placeholder");
      
      // 2. Upload the encrypted ciphertext to 0G Storage
      const hash = await uploadTo0GStorage(encryptedBlob);
      setRootHash(hash);
      
      // 3. Save to DB
      await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          asset_name: mediaTitle || "Unnamed Video",
          asset_type: 'video_message',
          root_hash: hash
        })
      });

      setIsSecured(true);
    } catch (error) {
      console.error("Failed to secure media:", error);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    fetch('/api/assets?user_id=demo-user-id')
      .then(res => res.json())
      .then(data => {
        if (data.assets) {
          setSecuredAssets(data.assets.filter((a: any) => a.asset_type === 'video_message'));
        }
      })
      .catch(err => console.error("Failed to fetch secured media:", err));
  }, [isSecured]);

  if (isSecured) {
    return (
      <div className="glass-panel max-w-2xl mx-auto p-8 rounded-3xl text-center space-y-4 animate-in fade-in zoom-in duration-500 mt-12">
        <div className="mx-auto w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-foreground" />
        </div>
        <h2 className="text-2xl font-light text-foreground">Media Encrypted</h2>
        <p className="text-muted-foreground text-sm font-light">
          Your final message has been securely stored on the 0G network. It will be waiting for your loved one.
        </p>
        <div className="mt-4 p-3 bg-black/30 rounded-xl border border-white/5 break-all">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">0G Storage Hash</p>
          <p className="text-xs font-mono text-foreground">{rootHash}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-light tracking-tight text-foreground">Media Vault</h1>
        <p className="text-sm font-light text-muted-foreground mt-2 leading-relaxed">
          Record a final video or voice message. This will be securely encrypted and revealed to your claimant only after they pass the verification challenge.
        </p>
      </div>

      <div className="glass-panel p-4 sm:p-6 rounded-3xl space-y-6">
        <div className="w-full aspect-video bg-black/60 rounded-2xl overflow-hidden relative flex items-center justify-center">
          {!mediaBlobUrl && (
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              className="w-full h-full object-cover absolute inset-0"
            />
          )}
          {mediaBlobUrl && (
            <video 
              src={mediaBlobUrl} 
              controls 
              className="w-full h-full object-cover absolute inset-0 z-10"
            />
          )}
          
          {!mediaBlobUrl && !isRecording && (
            <div className="z-10 flex flex-col items-center text-muted-foreground bg-background/80 p-6 rounded-2xl backdrop-blur-sm">
              <Video className="w-8 h-8 mb-3 opacity-80" />
              <span className="text-sm font-medium">Ready to record</span>
            </div>
          )}
          
          {isRecording && (
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-md">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-medium text-white tracking-widest uppercase">Recording</span>
            </div>
          )}
        </div>

        {mediaBlobUrl && (
          <div className="space-y-2 mt-6">
            <label className="text-sm font-medium text-foreground">Media Title</label>
            <input
              required
              type="text"
              className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
              placeholder="e.g. For my children..."
              value={mediaTitle}
              onChange={(e) => setMediaTitle(e.target.value)}
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6">
          {!isRecording && !mediaBlobUrl && (
            <button
              onClick={startRecording}
              className="flex w-full sm:w-auto items-center justify-center gap-2 px-8 py-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-full font-medium text-sm transition-all"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              Start Camera
            </button>
          )}
          
          {isRecording && (
            <button
              onClick={stopRecording}
              className="flex w-full sm:w-auto items-center justify-center gap-2 px-8 py-3 bg-red-500 text-white hover:bg-red-600 rounded-full font-medium text-sm transition-all"
            >
              <StopCircle className="w-4 h-4" />
              Stop Recording
            </button>
          )}

          {mediaBlobUrl && (
            <>
              <button
                onClick={() => {
                  setMediaBlobUrl(null);
                  startRecording();
                }}
                disabled={isUploading}
                className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-6 py-3 bg-muted text-foreground hover:bg-muted-foreground rounded-full font-medium text-sm transition-all disabled:opacity-50"
              >
                <Video className="w-4 h-4" />
                Retake
              </button>
              
              <button
                onClick={uploadMedia}
                disabled={isUploading || !mediaTitle.trim()}
                className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-8 py-3 bg-foreground text-background hover:bg-muted-foreground rounded-full font-medium text-sm transition-all disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Encrypting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Save & Encrypt
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {securedAssets.length > 0 && (
        <div className="mt-12 space-y-4">
          <h3 className="text-sm font-medium text-foreground uppercase tracking-widest px-2">Your Secured Media</h3>
          <div className="space-y-3">
            {securedAssets.map((asset) => (
              <div key={asset.id} className="glass-panel p-4 rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 bg-muted/30 rounded-full flex items-center justify-center shrink-0">
                  <Video className="w-4 h-4 text-foreground/70" />
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
