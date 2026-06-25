import crypto from "crypto";

export function generateUUID(): string {
  return crypto.randomUUID();
}

export function hashString(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

export function generateFingerprint(ip: string, userAgent: string): string {
  return hashString(`${ip}-${userAgent}`);
}
