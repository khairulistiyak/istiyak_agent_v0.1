import { maskSecrets } from "@istiyak/shared-utils";

export class SecretMasker {
  static mask(text: string, secrets: string[]): string {
    return maskSecrets(text, secrets);
  }
}
