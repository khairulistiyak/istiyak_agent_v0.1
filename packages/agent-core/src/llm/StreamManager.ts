export type ChunkCallback = (chunk: string) => void;

export class StreamManager {
  private activeStreams: Set<string> = new Set();

  public registerStream(id: string): void {
    this.activeStreams.add(id);
  }

  public endStream(id: string): void {
    this.activeStreams.delete(id);
  }

  public isStreaming(id: string): boolean {
    return this.activeStreams.has(id);
  }
}
export default StreamManager;
