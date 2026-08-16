import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";
import { generateEmbedding } from "../utils/embeddings.js";

// @route GET /api/products
export const getProducts = asyncHandler(async (req, res) => {
  const { keyword, category, page = 1, limit = 12 } = req.query;
  const filter = {};
  if (keyword) filter.$text = { $search: keyword };
  if (category) filter.category = category;

  const skip = (Number(page) - 1) * Number(limit);
  const [products, total] = await Promise.all([
    Product.find(filter).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
    Product.countDocuments(filter),
  ]);

  res.json({ products, page: Number(page), pages: Math.ceil(total / limit), total });
});

// @route GET /api/products/:id
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json(product);
});

// @route POST /api/products (admin)
export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, category, brand, price, countInStock, image, tags } = req.body;

  const embedding = await generateEmbedding(
    [name, description, category, (tags || []).join(" ")].join(" ")
  );

  const product = await Product.create({
    name,
    description,
    category,
    brand,
    price,
    countInStock,
    image,
    tags,
    embedding,
  });

  res.status(201).json(product);
});

// @route PUT /api/products/:id (admin)
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const fields = ["name", "description", "category", "brand", "price", "countInStock", "image", "tags"];
  let contentChanged = false;
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      if (["name", "description", "category", "tags"].includes(f)) contentChanged = true;
      product[f] = req.body[f];
    }
  }

  if (contentChanged) {
    product.embedding = await generateEmbedding(
      [product.name, product.description, product.category, (product.tags || []).join(" ")].join(" ")
    );
  }

  const updated = await product.save();
  res.json(updated);
});

// @route DELETE /api/products/:id (admin)
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  await product.deleteOne();
  res.json({ message: "Product removed" });
});

// @route GET /api/products/meta/categories
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct("category");
  res.json(categories);
});
