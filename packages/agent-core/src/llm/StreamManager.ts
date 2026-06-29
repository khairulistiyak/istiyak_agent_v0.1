/**
 * Manages streaming LLM responses with chunk buffering, callbacks,
 * partial output retrieval, and completion tracking.
 */
export class StreamManager {
  private chunks: string[] = [];
  private listeners: Array<(chunk: string) => void> = [];
  private completed = false;
  private error: Error | null = null;
  private totalBytes = 0;
  private chunkCount = 0;
  private startTime = 0;

  /**
   * Registers a callback that fires on every incoming chunk.
   */
  onChunk(callback: (chunk: string) => void): void {
    this.listeners.push(callback);
  }

  /**
   * Removes a previously registered chunk listener.
   */
  removeListener(callback: (chunk: string) => void): void {
    this.listeners = this.listeners.filter(l => l !== callback);
  }

  /**
   * Appends a new chunk to the buffer and notifies all listeners.
   */
  append(chunk: string): void {
    if (this.completed) {
      console.warn("[StreamManager] Attempted to append after stream completed");
      return;
    }

    if (this.startTime === 0) {
      this.startTime = Date.now();
    }

    this.chunks.push(chunk);
    this.totalBytes += chunk.length;
    this.chunkCount++;

    // Notify all listeners
    for (const listener of this.listeners) {
      try {
        listener(chunk);
      } catch (err: any) {
        console.error("[StreamManager] Listener error:", err.message);
      }
    }
  }

  /**
   * Returns the full accumulated output so far.
   */
  getOutput(): string {
    return this.chunks.join("");
  }

  /**
   * Returns the partial output (same as getOutput, but semantically
   * indicates the stream may not be complete).
   */
  getPartialOutput(): string {
    return this.chunks.join("");
  }

  /**
   * Returns the last N chunks (useful for incremental UI updates).
   */
  getRecentChunks(n: number): string[] {
    return this.chunks.slice(-n);
  }

  /**
   * Marks the stream as complete.
   */
  complete(): void {
    this.completed = true;
  }

  /**
   * Marks the stream as failed with an error.
   */
  fail(error: Error): void {
    this.error = error;
    this.completed = true;
  }

  /**
   * Whether the stream has finished (either success or error).
   */
  isComplete(): boolean {
    return this.completed;
  }

  /**
   * Whether the stream ended with an error.
   */
  hasError(): boolean {
    return this.error !== null;
  }

  /**
   * Returns the error if the stream failed, null otherwise.
   */
  getError(): Error | null {
    return this.error;
  }

  /**
   * Returns streaming statistics.
   */
  getStats() {
    const elapsed = this.startTime > 0 ? Date.now() - this.startTime : 0;
    return {
      chunkCount: this.chunkCount,
      totalBytes: this.totalBytes,
      totalChars: this.getOutput().length,
      elapsedMs: elapsed,
      charsPerSecond: elapsed > 0 ? Math.round((this.getOutput().length / elapsed) * 1000) : 0,
      isComplete: this.completed,
      hasError: this.error !== null
    };
  }

  /**
   * Resets the stream manager for reuse.
   */
  clear(): void {
    this.chunks = [];
    this.listeners = [];
    this.completed = false;
    this.error = null;
    this.totalBytes = 0;
    this.chunkCount = 0;
    this.startTime = 0;
  }
}
