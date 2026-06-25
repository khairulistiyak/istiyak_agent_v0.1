import { maskSecrets } from "@istiyak/shared-utils";

export class SecretMasker {
  public mask(text: string): string {
    return maskSecrets(text);
  }

  public maskObject(obj: Record<string, any>): Record<string, any> {
    const serialized = JSON.stringify(obj);
    const masked = this.mask(serialized);
    return JSON.parse(masked);
  }
}
