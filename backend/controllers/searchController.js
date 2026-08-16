import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import { generateEmbedding, cosineSimilarity, usingRealEmbeddings } from "../utils/embeddings.js";

/**
 * @route GET /api/search?q=...
 * AI-powered semantic search.
 *
 * Primary path: MongoDB Atlas Vector Search via the `$vectorSearch` aggregation
 * stage against the `VECTOR_INDEX_NAME` index (requires Atlas, not local Mongo).
 *
 * Fallback path: if $vectorSearch isn't available (e.g. local MongoDB during
 * development, or the index hasn't been created yet), we compute embeddings
 * in-memory and rank by cosine similarity so the feature still works end to end.
 */
export const semanticSearch = asyncHandler(async (req, res) => {
  const { q, limit = 10 } = req.query;
  if (!q || !q.trim()) {
    res.status(400);
    throw new Error("Query parameter 'q' is required");
  }

  const queryEmbedding = await generateEmbedding(q);

  try {
    const results = await Product.aggregate([
      {
        $vectorSearch: {
          index: process.env.VECTOR_INDEX_NAME || "product_vector_index",
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: Math.max(100, Number(limit) * 10),
          limit: Number(limit),
        },
      },
      {
        $project: {
          name: 1,
          description: 1,
          category: 1,
          brand: 1,
          price: 1,
          countInStock: 1,
          image: 1,
          rating: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ]);

    return res.json({
      mode: "atlas_vector_search",
      usingRealEmbeddings: usingRealEmbeddings(),
      query: q,
      results,
    });
  } catch (err) {
    // Likely running against non-Atlas Mongo, or the vector index doesn't exist yet.
    // Gracefully fall back to in-memory cosine similarity so the app still works.
    const products = await Product.find({ embedding: { $exists: true } }).select(
      "+embedding name description category brand price countInStock image rating"
    );

    const ranked = products
      .map((p) => ({
        product: p,
        score: cosineSimilarity(queryEmbedding, p.embedding || []),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, Number(limit))
      .map(({ product, score }) => {
        const obj = product.toObject();
        delete obj.embedding;
        obj.score = score;
        return obj;
      });

    return res.json({
      mode: "in_memory_fallback",
      note: "Atlas $vectorSearch unavailable (needs MongoDB Atlas + a vector index). Falling back to in-memory cosine similarity.",
      usingRealEmbeddings: usingRealEmbeddings(),
      query: q,
      results: ranked,
    });
  }
});

// @route GET /api/search/similar/:id — "you might also like" via vector similarity
export const similarProducts = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).select("+embedding");
  if (!product || !product.embedding) {
    res.status(404);
    throw new Error("Product or embedding not found");
  }

  try {
    const results = await Product.aggregate([
      {
        $vectorSearch: {
          index: process.env.VECTOR_INDEX_NAME || "product_vector_index",
          path: "embedding",
          queryVector: product.embedding,
          numCandidates: 100,
          limit: 6,
        },
      },
      { $match: { _id: { $ne: new mongoose.Types.ObjectId(product._id) } } },
      { $project: { name: 1, price: 1, image: 1, category: 1, score: { $meta: "vectorSearchScore" } } },
    ]);
    return res.json({ mode: "atlas_vector_search", results });
  } catch (err) {
    const all = await Product.find({ _id: { $ne: product._id }, embedding: { $exists: true } }).select(
      "+embedding name price image category"
    );
    const ranked = all
      .map((p) => ({ product: p, score: cosineSimilarity(product.embedding, p.embedding || []) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(({ product: p, score }) => {
        const obj = p.toObject();
        delete obj.embedding;
        obj.score = score;
        return obj;
      });
    return res.json({ mode: "in_memory_fallback", results: ranked });
  }
});
