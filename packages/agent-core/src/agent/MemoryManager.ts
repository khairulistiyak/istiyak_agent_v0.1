import { SessionMemory } from "../memory/SessionMemory.js";
import { WorkspaceMemory } from "../memory/WorkspaceMemory.js";
import { VectorMemory } from "../memory/VectorMemory.js";

export class MemoryManager {
  public session: SessionMemory;
  public workspace: WorkspaceMemory;
  public vector: VectorMemory;

  constructor(workspacePath: string) {
    this.session = new SessionMemory();
    this.workspace = new WorkspaceMemory(workspacePath);
    this.vector = new VectorMemory();
  }
}

export default MemoryManager;
