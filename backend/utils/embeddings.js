import OpenAI from "openai";

const hasOpenAIKey =
  process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes("replace-me");

const client = hasOpenAIKey ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

const DIMENSIONS = Number(process.env.EMBEDDING_DIMENSIONS) || 1536;

/**
 * Deterministic local fallback "embedding" so the app is runnable end-to-end
 * without an OpenAI key. It's a simple bag-of-words hashing vector — NOT a
 * real semantic embedding, but it lets vector search / cosine similarity
 * code paths work for demos. Swap in a real OPENAI_API_KEY for true
 * AI-powered semantic search.
 */
function localFallbackEmbedding(text) {
  const vec = new Array(DIMENSIONS).fill(0);
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean);
  for (const word of words) {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash * 31 + word.charCodeAt(i)) >>> 0;
    }
    const idx = hash % DIMENSIONS;
    vec[idx] += 1;
  }
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map((v) => v / norm);
}

/**
 * Generate a vector embedding for a piece of text.
 * Uses OpenAI's embedding model when OPENAI_API_KEY is configured,
 * otherwise falls back to a local deterministic vector so the demo runs offline.
 */
export async function generateEmbedding(text) {
  if (!text || !text.trim()) return null;

  if (client) {
    const response = await client.embeddings.create({
      model: process.env.EMBEDDING_MODEL || "text-embedding-3-small",
      input: text,
    });
    return response.data[0].embedding;
  }

  return localFallbackEmbedding(text);
}

/** Cosine similarity between two equal-length vectors — used by the fallback
 *  in-memory search path when Atlas Vector Search / $vectorSearch isn't available. */
export function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export const usingRealEmbeddings = () => hasOpenAIKey;
