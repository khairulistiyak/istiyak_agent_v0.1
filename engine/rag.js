import fs from "fs";
import path from "path";
import os from "os";

// Directory exclusions (same as watcher and scan_project)
const IGNORED_DIRS = [
  "node_modules",
  ".git",
  "dist",
  "target",
  ".next",
  "build",
  ".svelte-kit",
  ".tauri"
];

const ALLOWED_EXTENSIONS = [
  ".js", ".ts", ".tsx", ".jsx", ".py", ".cpp", ".c", ".h", ".cs", ".net", ".css", ".json", ".md"
];

// In-memory index of code chunks
let currentWorkspaceChunks = [];

/**
 * Clean and tokenize code/text.
 */
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(token => token.length > 2);
}

/**
 * Split text into overlapping chunks.
 */
function chunkFile(content, filePath, relativePath) {
  const lines = content.split("\n");
  const chunks = [];
  const chunkSize = 15; // lines per chunk
  const chunkOverlap = 5; // lines overlap

  for (let i = 0; i < lines.length; i += (chunkSize - chunkOverlap)) {
    const chunkLines = lines.slice(i, i + chunkSize);
    if (chunkLines.length === 0) break;
    
    const text = chunkLines.join("\n");
    if (text.trim().length < 20) continue; // Skip very small chunks

    chunks.push({
      text,
      filePath,
      relativePath,
      startLine: i + 1,
      endLine: i + chunkLines.length,
      tokens: tokenize(text)
    });

    if (i + chunkSize >= lines.length) break;
  }
  return chunks;
}

/**
 * Recursively scans workspace directories to collect and index source files.
 */
function walkWorkspace(dir, workspacePath, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (IGNORED_DIRS.includes(file)) continue;

    const fullPath = path.join(dir, file);
    let stat;
    try {
      stat = fs.statSync(fullPath);
    } catch (e) {
      continue;
    }

    if (stat.isDirectory()) {
      walkWorkspace(fullPath, workspacePath, fileList);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (ALLOWED_EXTENSIONS.includes(ext)) {
        fileList.push(fullPath);
      }
    }
  }
  return fileList;
}

/**
 * Builds the local TF-IDF vector index for the workspace.
 */
export function indexWorkspace(workspacePath) {
  console.log(`[RAG] Starting workspace indexing: ${workspacePath}`);
  try {
    if (!fs.existsSync(workspacePath)) {
      console.warn(`[RAG] Workspace path does not exist: ${workspacePath}`);
      return false;
    }

    const files = walkWorkspace(workspacePath, workspacePath);
    const allChunks = [];

    for (const filePath of files) {
      try {
        const content = fs.readFileSync(filePath, "utf-8");
        const relPath = path.relative(workspacePath, filePath);
        const fileChunks = chunkFile(content, filePath, relPath);
        allChunks.push(...fileChunks);
      } catch (err) {
        console.warn(`[RAG] Failed to read/chunk file ${filePath}:`, err.message);
      }
    }

    currentWorkspaceChunks = allChunks;

    // Cache to disk
    const home = os.homedir();
    const cachePath = path.join(home, ".istiyak_rag_cache.json");
    const serialized = allChunks.map(c => ({
      text: c.text,
      filePath: c.filePath,
      relativePath: c.relativePath,
      startLine: c.startLine,
      endLine: c.endLine
    }));
    fs.writeFileSync(cachePath, JSON.stringify({ workspacePath, chunks: serialized }, null, 2), "utf-8");

    console.log(`[RAG] Index completed. Chunks count: ${allChunks.length}`);
    return true;
  } catch (err) {
    console.error("[RAG] Indexing failed:", err);
    return false;
  }
}

/**
 * Computes TF-IDF similarity query match scores.
 */
export function searchWorkspace(query, limit = 5) {
  if (!query) return [];
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  // Compute Document Frequencies
  const df = {};
  const N = currentWorkspaceChunks.length;
  
  if (N === 0) {
    // Attempt loading from disk cache
    try {
      const home = os.homedir();
      const cachePath = path.join(home, ".istiyak_rag_cache.json");
      if (fs.existsSync(cachePath)) {
        const cache = JSON.parse(fs.readFileSync(cachePath, "utf-8"));
        currentWorkspaceChunks = cache.chunks.map(c => ({
          ...c,
          tokens: tokenize(c.text)
        }));
      }
    } catch (e) {
      console.warn("[RAG] Failed to restore from disk cache:", e.message);
    }
  }

  if (currentWorkspaceChunks.length === 0) return [];

  // Pre-calculate document frequencies for query tokens
  queryTokens.forEach(token => {
    df[token] = 0;
    currentWorkspaceChunks.forEach(chunk => {
      if (chunk.tokens.includes(token)) {
        df[token]++;
      }
    });
  });

  const results = [];

  for (const chunk of currentWorkspaceChunks) {
    let score = 0;
    
    // Simple TF-IDF dot-product cosine similarity
    queryTokens.forEach(token => {
      const tf = chunk.tokens.filter(t => t === token).length;
      if (tf > 0) {
        const docFreq = df[token] || 0;
        const idf = Math.log((N + 1) / (docFreq + 1)) + 1;
        score += tf * idf;
      }
    });

    if (score > 0) {
      results.push({
        text: chunk.text,
        relativePath: chunk.relativePath,
        filePath: chunk.filePath,
        startLine: chunk.startLine,
        endLine: chunk.endLine,
        score
      });
    }
  }

  // Sort descending by similarity score
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
