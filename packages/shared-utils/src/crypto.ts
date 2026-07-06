import crypto from "crypto";

export function sha256(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}

export function encrypt(text: string, secretKey: string): string {
  const iv = crypto.randomBytes(12); // GCM recommends 12 bytes
  const key = crypto.scryptSync(secretKey, "salt", 32);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // Format: iv:authTag:encrypted
  return iv.toString("hex") + ":" + authTag.toString("hex") + ":" + encrypted.toString("hex");
}

export function decrypt(hash: string, secretKey: string): string {
  try {
    const parts = hash.split(":");
    if (parts.length < 3) return ""; // Need at least iv:authTag:encrypted
    
    const ivHex = parts[0];
    const authTagHex = parts[1];
    const encryptedHex = parts.slice(2).join(":"); // Handle : in encrypted data
    
    if (!ivHex || !authTagHex) return "";
    
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const encryptedText = Buffer.from(encryptedHex, "hex");
    
    // Validate lengths for GCM
    if (iv.length !== 12 || authTag.length !== 16) return "";
    
    const key = crypto.scryptSync(secretKey, "salt", 32);
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    // Format/parsing errors return empty string
    if (error instanceof Error && 
        (error.message.includes("Invalid initialization vector") ||
         error.message.includes("Invalid hex string") ||
         error.message.includes("Invalid key length"))) {
      return "";
    }
    // Decryption/authentication errors (wrong key) throw
    throw error;
  }
}
