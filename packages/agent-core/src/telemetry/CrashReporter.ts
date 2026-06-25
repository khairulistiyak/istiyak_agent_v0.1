export class CrashReporter {
  private sentryDsn?: string;

  constructor(sentryDsn?: string) {
    this.sentryDsn = sentryDsn;
  }

  public reportError(error: Error, context?: Record<string, any>): void {
    console.error(`[CrashReporter] Capture exception: ${error.message}`, error.stack || "");
    if (context) {
      console.error(`[CrashReporter] Exception context:`, JSON.stringify(context, null, 2));
    }
    
    if (this.sentryDsn) {
      // Logic to trigger real Sentry exception logs captures...
    }
  }
}
export default CrashReporter;
