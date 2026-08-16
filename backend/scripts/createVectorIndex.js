/**
 * Creates the MongoDB Atlas Vector Search index required for AI semantic search.
 *
 * NOTE: Vector Search indexes can only be created on MongoDB Atlas (M0+ clusters,
 * including the free tier), not on local/self-hosted MongoDB. If this script
 * fails, create the index manually in the Atlas UI:
 *   Atlas UI -> your cluster -> Search -> Create Search Index -> JSON Editor
 *   Database: ai_ecommerce, Collection: products
 *   Paste the index definition printed below.
 */
import "dotenv/config";
import mongoose from "mongoose";

const indexName = process.env.VECTOR_INDEX_NAME || "product_vector_index";
const dimensions = Number(process.env.EMBEDDING_DIMENSIONS) || 1536;

const indexDefinition = {
  name: indexName,
  type: "vectorSearch",
  definition: {
    fields: [
      {
        type: "vector",
        path: "embedding",
        numDimensions: dimensions,
        similarity: "cosine",
      },
      { type: "filter", path: "category" },
      { type: "filter", path: "price" },
    ],
  },
};

async function main() {
  console.log("Vector Search index definition (paste into Atlas UI if this script fails):");
  console.log(JSON.stringify(indexDefinition, null, 2));

  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;

  try {
    await db.command({
      createSearchIndexes: "products",
      indexes: [indexDefinition],
    });
    console.log(`Vector search index "${indexName}" creation requested. It may take a minute to build in Atlas.`);
  } catch (err) {
    console.error("Could not create index via driver command:", err.message);
    console.log("Create it manually via the Atlas UI using the JSON definition printed above.");
  } finally {
    await mongoose.disconnect();
  }
}

main();
