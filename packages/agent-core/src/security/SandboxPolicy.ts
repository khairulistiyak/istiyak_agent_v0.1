export class SandboxPolicy {
  static getPolicy() {
    return {
      networkEnabled: false,
      readOnlyRoots: ["/bin", "/lib", "/usr"]
    };
  }
}
