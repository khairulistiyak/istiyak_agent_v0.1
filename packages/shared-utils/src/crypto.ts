import crypto from "crypto";

export function sha256(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}

export function encrypt(text: string, secretKey: string): string {
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(secretKey, "salt", 32);
  const cipher = crypto.createCipheriv("aes-256-ctr", key, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export function decrypt(hash: string, secretKey: string): string {
  const parts = hash.split(":");
  const ivHex = parts.shift();
  if (!ivHex) return "";
  const iv = Buffer.from(ivHex, "hex");
  const encryptedText = Buffer.from(parts.join(":"), "hex");
  const key = crypto.scryptSync(secretKey, "salt", 32);
  const decipher = crypto.createDecipheriv("aes-256-ctr", key, iv);
  const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  return decrypted.toString();
}
