import { ToolRegistry } from "./ToolRegistry.js";
import { ScanProjectTool } from "../filesystem/ScanProjectTool.js";
import { ListFilesTool } from "../filesystem/ListFilesTool.js";
import { ReadFileTool } from "../filesystem/ReadFileTool.js";
import { WriteFileTool } from "../filesystem/WriteFileTool.js";
import { PreciseEditTool } from "../filesystem/PreciseEditTool.js";
import { RunCommandTool } from "../terminal/RunCommandTool.js";
import { SearchTool } from "../filesystem/SearchTool.js";

// New Filesystem Tools
import { ASTEditTool } from "../filesystem/ASTEditTool.js";
import { RenameTool } from "../filesystem/RenameTool.js";
import { MoveTool } from "../filesystem/MoveTool.js";
import { DeleteTool } from "../filesystem/DeleteTool.js";
import { CreateDirectoryTool } from "../filesystem/CreateDirectoryTool.js";

// New Terminal Tools
import { Sandbox } from "../terminal/Sandbox.js";
import { ProcessManager } from "../terminal/ProcessManager.js";

// New Git Tools
import { StatusTool } from "../git/StatusTool.js";
import { DiffTool } from "../git/DiffTool.js";
import { CommitTool } from "../git/CommitTool.js";
import { BranchTool } from "../git/BranchTool.js";
import { CheckoutTool } from "../git/CheckoutTool.js";
import { StashTool } from "../git/StashTool.js";
import { LogTool } from "../git/LogTool.js";

// New Web Tools
import { GoogleSearchTool } from "../web/GoogleSearchTool.js";
import { UrlContextTool } from "../web/UrlContextTool.js";
import { FetchUrlTool } from "../web/FetchUrlTool.js";
import { CrawlWebsiteTool } from "../web/CrawlWebsiteTool.js";

// New Memory Tools
import { ReadMemoryTool } from "../memory/ReadMemoryTool.js";
import { WriteMemoryTool } from "../memory/WriteMemoryTool.js";
import { CompressMemoryTool } from "../memory/CompressMemoryTool.js";
import { SummarizeMemoryTool } from "../memory/SummarizeMemoryTool.js";

// New Planning Tools
import { CreatePlanTool } from "../planning/CreatePlanTool.js";
import { UpdatePlanTool } from "../planning/UpdatePlanTool.js";
import { ReflectTool } from "../planning/ReflectTool.js";
import { WalkthroughTool } from "../planning/WalkthroughTool.js";

// New Agent Tools
import { DelegateAgentTool } from "../agent/DelegateAgentTool.js";
import { SpawnSubAgentTool } from "../agent/SpawnSubAgentTool.js";
import { MergeResultTool } from "../agent/MergeResultTool.js";

export function loadAllTools() {
  ToolRegistry.register(new ScanProjectTool());
  ToolRegistry.register(new ListFilesTool());
  ToolRegistry.register(new ReadFileTool());
  ToolRegistry.register(new WriteFileTool());
  ToolRegistry.register(new PreciseEditTool());
  ToolRegistry.register(new RunCommandTool());
  ToolRegistry.register(new SearchTool());

  // Filesystem Tools
  ToolRegistry.register(new ASTEditTool());
  ToolRegistry.register(new RenameTool());
  ToolRegistry.register(new MoveTool());
  ToolRegistry.register(new DeleteTool());
  ToolRegistry.register(new CreateDirectoryTool());

  // Terminal Tools
  ToolRegistry.register(new Sandbox());
  ToolRegistry.register(new ProcessManager());

  // Git Tools
  ToolRegistry.register(new StatusTool());
  ToolRegistry.register(new DiffTool());
  ToolRegistry.register(new CommitTool());
  ToolRegistry.register(new BranchTool());
  ToolRegistry.register(new CheckoutTool());
  ToolRegistry.register(new StashTool());
  ToolRegistry.register(new LogTool());

  // Web Tools
  ToolRegistry.register(new GoogleSearchTool());
  ToolRegistry.register(new UrlContextTool());
  ToolRegistry.register(new FetchUrlTool());
  ToolRegistry.register(new CrawlWebsiteTool());

  // Memory Tools
  ToolRegistry.register(new ReadMemoryTool());
  ToolRegistry.register(new WriteMemoryTool());
  ToolRegistry.register(new CompressMemoryTool());
  ToolRegistry.register(new SummarizeMemoryTool());

  // Planning Tools
  ToolRegistry.register(new CreatePlanTool());
  ToolRegistry.register(new UpdatePlanTool());
  ToolRegistry.register(new ReflectTool());
  ToolRegistry.register(new WalkthroughTool());

  // Agent Tools
  ToolRegistry.register(new DelegateAgentTool());
  ToolRegistry.register(new SpawnSubAgentTool());
  ToolRegistry.register(new MergeResultTool());
}
