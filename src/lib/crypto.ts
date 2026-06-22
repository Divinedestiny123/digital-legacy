/**
 * Utility functions for client-side encryption using Web Crypto API (AES-GCM).
 * This ensures data is never exposed in plaintext to the decentralized storage network.
 */

// Generate a random initialization vector
const generateIv = () => window.crypto.getRandomValues(new Uint8Array(12));

// Convert a string password/key into a CryptoKey for AES-GCM
const getKeyMaterial = async (password: string) => {
  const enc = new TextEncoder();
  return window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
};

export const getCryptoKey = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
  const keyMaterial = await getKeyMaterial(password);
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
};

export const encryptBlob = async (blob: Blob, secret: string): Promise<Blob> => {
  // We use a fixed salt here for hackathon simplicity. In production, store a random salt per user.
  const salt = new TextEncoder().encode("digital-legacy-salt");
  const key = await getCryptoKey(secret, salt);
  const iv = generateIv();
  
  const arrayBuffer = await blob.arrayBuffer();
  
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    arrayBuffer
  );

  // Prepend the IV to the encrypted data so we can decrypt it later
  const combinedBuffer = new Uint8Array(iv.byteLength + encryptedBuffer.byteLength);
  combinedBuffer.set(iv, 0);
  combinedBuffer.set(new Uint8Array(encryptedBuffer), iv.byteLength);

  return new Blob([combinedBuffer], { type: "application/octet-stream" });
};

export const decryptBlob = async (encryptedBlob: Blob, secret: string): Promise<Blob> => {
  const salt = new TextEncoder().encode("digital-legacy-salt");
  const key = await getCryptoKey(secret, salt);
  
  const arrayBuffer = await encryptedBlob.arrayBuffer();
  const iv = arrayBuffer.slice(0, 12);
  const data = arrayBuffer.slice(12);
  
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: new Uint8Array(iv),
    },
    key,
    data
  );

  return new Blob([decryptedBuffer]);
};
