import { VectorClient } from "@istiyak/agent-memory";

export class VectorMemory {
  private client: VectorClient;

  constructor() {
    this.client = new VectorClient();
  }

  public async addFact(id: string, text: string, metadata: Record<string, any> = {}): Promise<void> {
    await this.client.upsert(id, text, metadata);
  }

  public async searchFacts(queryText: string, topK: number = 3): Promise<Array<{ id: string; score: number }>> {
    return await this.client.query(queryText, topK);
  }
}

export default VectorMemory;
