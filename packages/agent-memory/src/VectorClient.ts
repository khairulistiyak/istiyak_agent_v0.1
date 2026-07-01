import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";

const ALLOWED_EXTENSIONS = [
  ".js", ".ts", ".tsx", ".jsx", ".py", ".cpp", ".c", ".h", ".cs", ".net", ".css", ".json", ".md"
];

const IGNORED_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "target",
  ".gemini",
  "out",
  ".output"
]);

interface Chunk {
  text: string;
  filePath: string;
  relativePath: string;
  startLine: number;
  endLine: number;
  tokens: string[];
}

let currentWorkspaceChunks: Chunk[] = [];
let invertedIndex = new Map<string, Set<number>>();

function buildInvertedIndex() {
  invertedIndex = new Map();
  for (let i = 0; i < currentWorkspaceChunks.length; i++) {
    const chunk = currentWorkspaceChunks[i];
    for (const token of chunk.tokens) {
      if (!invertedIndex.has(token)) {
        invertedIndex.set(token, new Set());
      }
      invertedIndex.get(token)!.add(i);
    }
  }
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ") // Support Unicode letters/numbers (like Bangla)
    .split(/\s+/)
    .filter(token => token.length > 2);
}

function chunkFile(content: string, filePath: string, relativePath: string): Chunk[] {
  const lines = content.split("\n");
  const chunks: Chunk[] = [];
  const chunkSize = 15;
  const chunkOverlap = 5;

  for (let i = 0; i < lines.length; i += (chunkSize - chunkOverlap)) {
    const chunkLines = lines.slice(i, i + chunkSize);
    if (chunkLines.length === 0) break;
    
    const text = chunkLines.join("\n");
    if (text.trim().length < 20) continue;

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

function walkWorkspace(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (IGNORED_DIRS.has(file)) continue;

    const fullPath = path.join(dir, file);
    let stat;
    try {
      stat = fs.statSync(fullPath);
    } catch (e) {
      continue;
    }

    if (stat.isDirectory()) {
      walkWorkspace(fullPath, fileList);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (ALLOWED_EXTENSIONS.includes(ext)) {
        fileList.push(fullPath);
      }
    }
  }
  return fileList;
}

function getCachePath(workspacePath: string): string {
  const home = os.homedir();
  const normalized = path.resolve(workspacePath);
  const hash = crypto.createHash("md5").update(normalized).digest("hex");
  return path.join(home, `.istiyak_rag_cache_${hash}.json`);
}

export function indexWorkspace(workspacePath: string): boolean {
  console.log(`[RAG] Starting workspace indexing: ${workspacePath}`);
  try {
    if (!fs.existsSync(workspacePath)) {
      console.warn(`[RAG] Workspace path does not exist: ${workspacePath}`);
      return false;
    }

    const files = walkWorkspace(workspacePath);
    const allChunks: Chunk[] = [];

    for (const filePath of files) {
      try {
        const content = fs.readFileSync(filePath, "utf-8");
        const relPath = path.relative(workspacePath, filePath);
        const fileChunks = chunkFile(content, filePath, relPath);
        allChunks.push(...fileChunks);
      } catch (err: any) {
        console.warn(`[RAG] Failed to read/chunk file ${filePath}:`, err.message);
      }
    }

    currentWorkspaceChunks = allChunks;
    buildInvertedIndex();

    // Cache to disk namespaced by workspace path
    const cachePath = getCachePath(workspacePath);
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

export interface SearchResult {
  text: string;
  relativePath: string;
  filePath: string;
  startLine: number;
  endLine: number;
  score: number;
}

export function searchWorkspace(query: string, limit = 5, workspacePath?: string): SearchResult[] {
  if (!query) return [];
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  let N = currentWorkspaceChunks.length;
  
  if (N === 0 && workspacePath) {
    try {
      const cachePath = getCachePath(workspacePath);
      if (fs.existsSync(cachePath)) {
        const cache = JSON.parse(fs.readFileSync(cachePath, "utf-8"));
        // Extra validation
        if (path.resolve(cache.workspacePath) === path.resolve(workspacePath)) {
          currentWorkspaceChunks = cache.chunks.map((c: any) => ({
            ...c,
            tokens: tokenize(c.text)
          }));
          buildInvertedIndex();
          N = currentWorkspaceChunks.length;
        }
      }
    } catch (e: any) {
      console.warn("[RAG] Failed to restore from disk cache:", e.message);
    }
  }

  if (currentWorkspaceChunks.length === 0) return [];

  if (invertedIndex.size === 0 && currentWorkspaceChunks.length > 0) {
    buildInvertedIndex();
  }

  const matchingChunkIndices = new Set<number>();
  queryTokens.forEach(token => {
    const indices = invertedIndex.get(token);
    if (indices) {
      indices.forEach(idx => matchingChunkIndices.add(idx));
    }
  });

  const results: SearchResult[] = [];

  matchingChunkIndices.forEach(idx => {
    const chunk = currentWorkspaceChunks[idx];
    let score = 0;
    
    queryTokens.forEach(token => {
      const tf = chunk.tokens.filter(t => t === token).length;
      if (tf > 0) {
        const docFreq = invertedIndex.get(token)?.size || 0;
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
  });

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
