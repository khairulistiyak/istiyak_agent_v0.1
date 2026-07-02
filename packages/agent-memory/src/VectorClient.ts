import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";
import { EmbeddingClient, cosineSimilarity } from "./EmbeddingClient.js";

const ALLOWED_EXTENSIONS = [
  ".js",
  ".ts",
  ".tsx",
  ".jsx",
  ".py",
  ".cpp",
  ".c",
  ".h",
  ".cs",
  ".net",
  ".css",
  ".json",
  ".md",
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
  ".output",
]);

// Cache schema version — bump to invalidate old caches
const CACHE_VERSION = 2;
const RAG_MAX_FILES = 3000;
const RAG_MAX_FILE_BYTES = 1 * 1024 * 1024; // skip files > 1MB
const RAG_MAX_DEPTH = 8;

interface Chunk {
  text: string;
  filePath: string;
  relativePath: string;
  startLine: number;
  endLine: number;
  tokens: string[];
  embedding?: number[]; // semantic embedding vector (768-dim)
}

interface DiskChunk {
  text: string;
  filePath: string;
  relativePath: string;
  startLine: number;
  endLine: number;
  embedding?: number[];
}

interface CacheData {
  version: number;
  workspacePath: string;
  chunks: DiskChunk[];
}

let currentWorkspaceChunks: Chunk[] = [];
let invertedIndex = new Map<string, Set<number>>();

// Embedded lazy EmbeddingClient instance
let embeddingClient: EmbeddingClient | null = null;

function setApiKey(apiKey?: string) {
  if (apiKey) {
    embeddingClient = new EmbeddingClient(apiKey);
  } else {
    embeddingClient = null;
  }
}

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
    .filter((token) => token.length > 2);
}

function chunkFile(content: string, filePath: string, relativePath: string): Chunk[] {
  const lines = content.split("\n");
  const chunks: Chunk[] = [];
  const chunkSize = 15;
  const chunkOverlap = 5;

  for (let i = 0; i < lines.length; i += chunkSize - chunkOverlap) {
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
      tokens: tokenize(text),
    });

    if (i + chunkSize >= lines.length) break;
  }
  return chunks;
}

function walkWorkspace(dir: string, fileList: string[] = [], depth = 0): string[] {
  if (depth > RAG_MAX_DEPTH) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (fileList.length >= RAG_MAX_FILES) return fileList;
    if (IGNORED_DIRS.has(file)) continue;

    const fullPath = path.join(dir, file);
    let stat;
    try {
      stat = fs.statSync(fullPath);
    } catch (e) {
      continue;
    }

    if (stat.isDirectory()) {
      walkWorkspace(fullPath, fileList, depth + 1);
    } else if (stat.isFile()) {
      if (stat.size > RAG_MAX_FILE_BYTES) continue;
      const ext = path.extname(file).toLowerCase();
      if (fileList.length >= RAG_MAX_FILES) return fileList;
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

export async function indexWorkspace(workspacePath: string, apiKey?: string): Promise<boolean> {
  console.log(`[RAG] Starting workspace indexing: ${workspacePath}`);
  try {
    if (!fs.existsSync(workspacePath)) {
      console.warn(`[RAG] Workspace path does not exist: ${workspacePath}`);
      return false;
    }

    // Set embedding client if API key provided
    setApiKey(apiKey);
    const useEmbeddings = embeddingClient?.isAvailable() ?? false;

    const files = walkWorkspace(workspacePath);
    const allChunks: Chunk[] = [];

    for (const filePath of files) {
      try {
        const content = fs.readFileSync(filePath, "utf-8");
        const relPath = path.relative(workspacePath, filePath);
        const fileChunks = chunkFile(content, filePath, relPath);
        allChunks.push(...fileChunks);
      } catch (err: unknown) {
        console.warn(
          `[RAG] Failed to read/chunk file ${filePath}:`,
          err instanceof Error ? err.message : String(err)
        );
      }
    }

    // Generate embeddings in batch (if API key available)
    if (useEmbeddings && allChunks.length > 0) {
      console.log(`[RAG] Generating embeddings for ${allChunks.length} chunks...`);
      const texts = allChunks.map((c) => c.text);
      const embeddings = await embeddingClient!.embedBatch(texts);
      for (let i = 0; i < allChunks.length; i++) {
        if (embeddings[i]) {
          allChunks[i].embedding = embeddings[i]!.values;
        }
      }
      console.log(`[RAG] Embeddings generated for ${embeddings.filter(Boolean).length} chunks.`);
    }

    currentWorkspaceChunks = allChunks;
    buildInvertedIndex();

    // Cache to disk namespaced by workspace path (v2 format includes embeddings)
    const cachePath = getCachePath(workspacePath);
    const serialized: DiskChunk[] = allChunks.map((c) => ({
      text: c.text,
      filePath: c.filePath,
      relativePath: c.relativePath,
      startLine: c.startLine,
      endLine: c.endLine,
      embedding: c.embedding,
    }));
    const cacheData: CacheData = {
      version: CACHE_VERSION,
      workspacePath,
      chunks: serialized,
    };
    fs.writeFileSync(cachePath, JSON.stringify(cacheData), "utf-8");

    console.log(
      `[RAG] Index completed. Chunks: ${allChunks.length} | Embeddings: ${useEmbeddings}`
    );
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

export async function searchWorkspace(
  query: string,
  limit = 5,
  workspacePath?: string,
  apiKey?: string
): Promise<SearchResult[]> {
  if (!query) return [];
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  let N = currentWorkspaceChunks.length;

  // Set embedding client if API key provided
  if (apiKey) setApiKey(apiKey);

  if (N === 0 && workspacePath) {
    try {
      const cachePath = getCachePath(workspacePath);
      if (fs.existsSync(cachePath)) {
        const raw = fs.readFileSync(cachePath, "utf-8");
        const cache: CacheData = JSON.parse(raw);
        if (
          cache.version === CACHE_VERSION &&
          path.resolve(cache.workspacePath) === path.resolve(workspacePath)
        ) {
          currentWorkspaceChunks = cache.chunks.map((c: DiskChunk) => ({
            ...c,
            tokens: tokenize(c.text),
          }));
          buildInvertedIndex();
          N = currentWorkspaceChunks.length;
        }
      }
    } catch (e: unknown) {
      console.warn(
        "[RAG] Failed to restore from disk cache:",
        e instanceof Error ? e.message : String(e)
      );
    }
  }

  if (currentWorkspaceChunks.length === 0) return [];

  if (invertedIndex.size === 0 && currentWorkspaceChunks.length > 0) {
    buildInvertedIndex();
  }

  // Generate query embedding (if available)
  let queryEmbedding: number[] | null = null;
  if (embeddingClient?.isAvailable()) {
    const vec = await embeddingClient.embed(query);
    if (vec) queryEmbedding = vec.values;
  }

  const matchingChunkIndices = new Set<number>();
  queryTokens.forEach((token) => {
    const indices = invertedIndex.get(token);
    if (indices) {
      indices.forEach((idx) => matchingChunkIndices.add(idx));
    }
  });

  // When no TF-IDF matches but embeddings exist, score ALL chunks
  if (matchingChunkIndices.size === 0 && queryEmbedding && currentWorkspaceChunks.length > 0) {
    for (let i = 0; i < currentWorkspaceChunks.length; i++) {
      matchingChunkIndices.add(i);
    }
  }

  const results: SearchResult[] = [];

  matchingChunkIndices.forEach((idx) => {
    const chunk = currentWorkspaceChunks[idx];

    // TF-IDF score
    let tfidfScore = 0;
    queryTokens.forEach((token) => {
      const tf = chunk.tokens.filter((t) => t === token).length;
      if (tf > 0) {
        const docFreq = invertedIndex.get(token)?.size || 0;
        const idf = Math.log((N + 1) / (docFreq + 1)) + 1;
        tfidfScore += tf * idf;
      }
    });

    // Cosine similarity score
    let cosineScore = 0;
    if (queryEmbedding && chunk.embedding && chunk.embedding.length > 0) {
      cosineScore = cosineSimilarity(queryEmbedding, chunk.embedding);
      cosineScore = Math.max(0, (cosineScore + 1) / 2);
    }

    const hasTfidf = tfidfScore > 0;
    const hasCosine = cosineScore > 0;

    let finalScore: number;
    if (hasTfidf && hasCosine) {
      finalScore = 0.3 * Math.min(1, tfidfScore / 10) + 0.7 * cosineScore;
    } else if (hasCosine) {
      finalScore = cosineScore;
    } else if (hasTfidf) {
      finalScore = tfidfScore;
    } else {
      return;
    }

    if (finalScore > 0) {
      results.push({
        text: chunk.text,
        relativePath: chunk.relativePath,
        filePath: chunk.filePath,
        startLine: chunk.startLine,
        endLine: chunk.endLine,
        score: finalScore,
      });
    }
  });

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}
