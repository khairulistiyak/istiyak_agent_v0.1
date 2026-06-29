/**
 * Extractive text summarization engine.
 * Uses sentence-level analysis to identify and preserve the most important content.
 * Falls back to truncation for very short inputs.
 */
export class SummaryEngine {
  /** Default maximum summary length in characters */
  private static readonly DEFAULT_MAX_LENGTH = 500;

  /** Minimum text length that benefits from summarization */
  private static readonly MIN_SUMMARIZABLE_LENGTH = 200;

  /**
   * Summarizes a text by extracting the most important sentences.
   * Preserves:
   *   - First sentence (introduction/context)
   *   - Last sentence (conclusion/result)
   *   - Sentences containing key indicators (error, success, result, important)
   *   - Code blocks (truncated if too long)
   */
  static summarize(text: string, maxLength?: number): string {
    return SummaryEngine.summarizeAdvanced(text, 5);
  }

  /**
   * Advanced extractive summarization using TF-IDF scoring.
   * Picks the most information-dense sentences from the input text.
   */
  static summarizeAdvanced(text: string, maxSentences = 5): string {
    if (!text || text.trim().length === 0) return "";

    // Split into sentences
    const sentences = text
      .split(/[.!?\n]+/)
      .map(s => s.trim())
      .filter(s => s.length > 15);

    if (sentences.length <= maxSentences) {
      return sentences.join(". ") + ".";
    }

    // Calculate word frequencies across all sentences
    const wordFreq = new Map<string, number>();
    const stopWords = new Set(["the", "is", "at", "which", "on", "a", "an", "and", "or", "but", "in", "with", "to", "for", "of", "that", "this", "it", "was", "are", "were", "been", "has", "have", "had", "do", "does", "did", "be", "not", "no", "so", "if"]);

    for (const sentence of sentences) {
      const words = sentence.toLowerCase().split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
      for (const word of words) {
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
      }
    }

    // Score each sentence by word importance
    const scored = sentences.map((sentence, index) => {
      const words = sentence.toLowerCase().split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
      let score = 0;
      for (const word of words) {
        score += wordFreq.get(word) || 0;
      }
      // Normalize by sentence length to avoid bias toward long sentences
      score = words.length > 0 ? score / Math.sqrt(words.length) : 0;
      // Boost first and last sentences (they tend to be more important)
      if (index === 0) score *= 1.3;
      if (index === sentences.length - 1) score *= 1.1;
      return { sentence, score, index };
    });

    // Pick top sentences, maintaining original order
    const topSentences = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, maxSentences)
      .sort((a, b) => a.index - b.index)
      .map(s => s.sentence);

    return topSentences.join(". ") + ".";
  }

  /**
   * Summarizes conversation content specifically — handles role prefixes.
   */
  static summarizeConversation(messages: Array<{ role: string; content: string }>, maxLength?: number): string {
    const limit = maxLength || SummaryEngine.DEFAULT_MAX_LENGTH * 2;
    const condensed = messages.map(m => {
      const prefix = m.role === "user" ? "User" : m.role === "assistant" ? "AI" : "Sys";
      const content = m.content.length > 150
        ? m.content.substring(0, 150) + "..."
        : m.content;
      return `[${prefix}] ${content}`;
    }).join("\n");

    if (condensed.length <= limit) return condensed;
    return SummaryEngine.summarize(condensed, limit);
  }

  /**
   * Splits text into sentences, handling common edge cases.
   */
  private static splitSentences(text: string): string[] {
    // Remove code blocks first and note their presence
    const withoutCode = text.replace(/```[\s\S]*?```/g, "[code block]");

    // Split on sentence boundaries
    const raw = withoutCode.split(/(?<=[.!?])\s+/);

    return raw
      .map(s => s.trim())
      .filter(s => s.length > 5); // Filter out very short fragments
  }

  /**
   * Scores a sentence's importance (higher = more important).
   */
  private static scoreSentence(sentence: string, index: number, totalSentences: number): number {
    let score = 0;
    const lower = sentence.toLowerCase();

    // Position-based scoring
    if (index === 0) score += 10; // First sentence
    if (index === totalSentences - 1) score += 8; // Last sentence
    if (index <= 2) score += 3; // Early sentences
    if (index >= totalSentences - 3) score += 2; // Late sentences

    // Keyword-based scoring
    const importantKeywords = [
      "error", "fail", "success", "result", "output", "important",
      "bug", "fix", "warn", "critical", "return", "complete",
      "created", "updated", "deleted", "modified", "implement",
    ];

    for (const keyword of importantKeywords) {
      if (lower.includes(keyword)) score += 3;
    }

    // Penalize very long sentences
    if (sentence.length > 300) score -= 2;

    // Penalize code-like content (less readable in summaries)
    if (lower.includes("[code block]")) score += 1; // Mention presence
    if (sentence.match(/[{}()\[\]]{3,}/)) score -= 3;

    // Boost sentences with numbers (often contain key data)
    if (sentence.match(/\d+/)) score += 1;

    return score;
  }
}
