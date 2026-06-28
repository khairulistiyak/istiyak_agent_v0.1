export function maskSecrets(text: string, secrets: string[]): string {
  let masked = text;
  for (const secret of secrets) {
    if (secret && secret.length > 4) {
      const escaped = secret.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "g");
      masked = masked.replace(regex, "******");
    }
  }
  return masked;
}
