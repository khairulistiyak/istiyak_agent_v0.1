export class CrashReporter {
  static reportCrash(err: Error) {
    console.error("[CrashReporter] Caught error:", err);
  }
}
