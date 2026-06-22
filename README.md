# Digital Legacy Gatekeeper

A decentralized, AI-powered deadman's switch for passing down your most sensitive digital assets (crypto seed phrases, final video messages, etc.) to your loved ones.

## 🌟 The Vision

Traditional estate planning wasn't built for Web3. If you hold crypto assets or private keys, passing them down securely without exposing them prematurely is a massive challenge. 

**Digital Legacy** solves this by combining decentralized storage with a conversational AI gatekeeper. 

Instead of trusting a centralized third party with your passwords, or writing them on a piece of paper that could be lost or stolen, you train a personalized AI with your memories. When the time comes, your authorized claimant must convince your AI gatekeeper of their identity by discussing the shared memories only they would know. Once the AI is convinced, the decentralized vault decrypts and reveals your assets.

## 🚀 How It Works

### For the Creator (You)
1. **Train Your Gatekeeper:** Go to the Creator Dashboard and write down private memories, inside jokes, or shared experiences you have with your loved one. These are embedded into a vector database (Supabase) and form the core knowledge of your AI clone.
2. **Lock Your Vault:** Record a final video message or securely type in your crypto seed phrases. 
3. **Decentralized Storage:** Your assets are heavily encrypted directly in the browser (AES-GCM) and uploaded to the **0G Storage Network**. (For this hackathon demo, we also implemented a robust Base64 database fallback to ensure seamless testing even if the testnet drops out).

### For the Claimant (Your Loved One)
1. **The AI Interview:** When they visit the Claimant Portal, they are greeted by your digital continuation. They must converse with the AI naturally.
2. **Semantic Verification:** Using RAG (Retrieval-Augmented Generation), the AI cross-references the conversation with the embedded memories. Unlike a standard password prompt, the claimant doesn't need to recite an exact string—they just need to prove they are who they say they are through natural conversation.
3. **Vault Unlocked:** Once the AI determines the claimant is authentic, the vault slides open. The encrypted data is pulled from the network and decrypted locally in their browser, revealing your seed phrases and final video message.

## 🛠️ Technology Stack

- **Frontend:** Next.js 14, React, Tailwind CSS, Lucide Icons
- **Decentralized Storage:** 0G Storage Network SDK (with Vercel-ready Base64 fallback)
- **Database & Auth:** Supabase (PostgreSQL, Row Level Security, Auth)
- **Vector Search & Embeddings:** Supabase `pgvector` with Xenova/all-MiniLM-L6-v2 (384 dimensions)
- **AI Engine:** OpenAI `gpt-4o-mini` (for the conversational Gatekeeper logic)
- **Cryptography:** Web Crypto API (AES-GCM) for zero-knowledge client-side encryption

## 🧪 How Judges Can Test the App

You can test the entire lifecycle end-to-end!

1. **Sign Up:** Create a dummy account.
2. **Create Memories:** Go to the Creator Dashboard. Click on the "Gatekeeper AI" tab. Add a memory (e.g., *"My claimant is John. We went to Paris in 2019 and ate terrible croissants near the Eiffel Tower."*)
3. **Lock an Asset:** Go to the "Asset Vault" or "Media Vault" tab. Add a seed phrase or record a quick video. Set the claimant name/email to whatever you like.
4. **Switch Roles:** Open an **Incognito window** and go to the Claimant Portal.
5. **The Challenge:** Enter the email address you just used to sign up. The AI will wake up. Chat with it! Mention the terrible croissants in Paris. 
6. **The Reward:** Watch the AI recognize you and slide open the Vault drawer to reveal your decrypted assets.

## 📱 Mobile First Design

The entire application features a premium, responsive UI. On desktop, the Claimant Portal provides a beautiful split-screen experience. On mobile, it utilizes native-feeling full-screen chat interfaces with sleek glassmorphism slide-up drawers for the Vault.

---

*Built with ❤️ for the Hackathon.*
