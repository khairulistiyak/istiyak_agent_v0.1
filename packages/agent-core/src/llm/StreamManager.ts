export class StreamManager {
  private chunks: string[] = [];

  append(chunk: string) {
    this.chunks.push(chunk);
  }

  getOutput(): string {
    return this.chunks.join("");
  }

  clear() {
    this.chunks = [];
  }
}
