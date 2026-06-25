import { ToolRegistry } from "./ToolRegistry.js";

// Filesystem
import { ScanProjectTool } from "../filesystem/ScanProjectTool.js";
import { ListFilesTool } from "../filesystem/ListFilesTool.js";
import { ReadFileTool } from "../filesystem/ReadFileTool.js";
import { WriteFileTool } from "../filesystem/WriteFileTool.js";
import { PreciseEditTool } from "../filesystem/PreciseEditTool.js";
import { ASTEditTool } from "../filesystem/ASTEditTool.js";
import { SearchTool } from "../filesystem/SearchTool.js";
import { RenameTool } from "../filesystem/RenameTool.js";
import { MoveTool } from "../filesystem/MoveTool.js";
import { DeleteTool } from "../filesystem/DeleteTool.js";
import { CreateDirectoryTool } from "../filesystem/CreateDirectoryTool.js";

// Terminal
import { RunCommandTool } from "../terminal/RunCommandTool.js";

// Git
import { StatusTool } from "../git/StatusTool.js";
import { DiffTool } from "../git/DiffTool.js";
import { CommitTool } from "../git/CommitTool.js";
import { BranchTool } from "../git/BranchTool.js";
import { CheckoutTool } from "../git/CheckoutTool.js";
import { StashTool } from "../git/StashTool.js";
import { LogTool } from "../git/LogTool.js";

// Web
import { GoogleSearchTool } from "../web/GoogleSearchTool.js";
import { UrlContextTool } from "../web/UrlContextTool.js";
import { FetchUrlTool } from "../web/FetchUrlTool.js";
import { CrawlWebsiteTool } from "../web/CrawlWebsiteTool.js";

// Memory
import { ReadMemoryTool } from "../memory/ReadMemoryTool.js";
import { WriteMemoryTool } from "../memory/WriteMemoryTool.js";
import { CompressMemoryTool } from "../memory/CompressMemoryTool.js";
import { SummarizeMemoryTool } from "../memory/SummarizeMemoryTool.js";

// Planning
import { CreatePlanTool } from "../planning/CreatePlanTool.js";
import { UpdatePlanTool } from "../planning/UpdatePlanTool.js";
import { ReflectTool } from "../planning/ReflectTool.js";
import { WalkthroughTool } from "../planning/WalkthroughTool.js";

// Agent
import { SpawnSubAgentTool } from "../agent/SpawnSubAgentTool.js";
import { DelegateAgentTool } from "../agent/DelegateAgentTool.js";
import { MergeResultTool } from "../agent/MergeResultTool.js";

export class ToolLoader {
  public static loadAll(registry: ToolRegistry): void {
    // Filesystem
    registry.register(new ScanProjectTool());
    registry.register(new ListFilesTool());
    registry.register(new ReadFileTool());
    registry.register(new WriteFileTool());
    registry.register(new PreciseEditTool());
    registry.register(new ASTEditTool());
    registry.register(new SearchTool());
    registry.register(new RenameTool());
    registry.register(new MoveTool());
    registry.register(new DeleteTool());
    registry.register(new CreateDirectoryTool());

    // Terminal
    registry.register(new RunCommandTool());

    // Git
    registry.register(new StatusTool());
    registry.register(new DiffTool());
    registry.register(new CommitTool());
    registry.register(new BranchTool());
    registry.register(new CheckoutTool());
    registry.register(new StashTool());
    registry.register(new LogTool());

    // Web
    registry.register(new GoogleSearchTool());
    registry.register(new UrlContextTool());
    registry.register(new FetchUrlTool());
    registry.register(new CrawlWebsiteTool());

    // Memory
    registry.register(new ReadMemoryTool());
    registry.register(new WriteMemoryTool());
    registry.register(new CompressMemoryTool());
    registry.register(new SummarizeMemoryTool());

    // Planning
    registry.register(new CreatePlanTool());
    registry.register(new UpdatePlanTool());
    registry.register(new ReflectTool());
    registry.register(new WalkthroughTool());

    // Agent Collaboration
    registry.register(new SpawnSubAgentTool());
    registry.register(new DelegateAgentTool());
    registry.register(new MergeResultTool());
  }
}

export default ToolLoader;
