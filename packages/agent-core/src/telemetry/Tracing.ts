export class Tracing {
  static startSpan(name: string) {
    return { end: () => {} };
  }
}
