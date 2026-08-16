import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },
    brand: { type: String, default: "Generic" },
    price: { type: Number, required: true, min: 0 },
    countInStock: { type: Number, required: true, min: 0, default: 0 },
    image: { type: String, default: "https://placehold.co/500x500?text=Product" },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    tags: [{ type: String }],
    // Vector embedding of `name + description + category + tags`, generated on save.
    // Indexed via an Atlas Vector Search index (see scripts/createVectorIndex.js)
    embedding: {
      type: [Number],
      default: undefined,
      select: false,
    },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text", category: "text", tags: "text" });

export default mongoose.model("Product", productSchema);
