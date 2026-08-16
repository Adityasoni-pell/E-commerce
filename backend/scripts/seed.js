/**
 * Seeds the database with an admin user, a demo user, and sample products
 * (each with a generated embedding for AI semantic search).
 * Run with: npm run seed
 */
import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";
import Product from "../models/Product.js";
import { generateEmbedding, usingRealEmbeddings } from "../utils/embeddings.js";

const products = [
  { name: "Wireless Noise-Cancelling Headphones", description: "Over-ear Bluetooth headphones with active noise cancellation, 30-hour battery life, and plush ear cushions for all-day comfort.", category: "Electronics", brand: "SoundWave", price: 199.99, countInStock: 25, tags: ["audio", "bluetooth", "travel"] },
  { name: "Smart Fitness Watch", description: "Track heart rate, sleep, and workouts with this waterproof smartwatch featuring GPS and a week-long battery.", category: "Electronics", brand: "PulseFit", price: 149.5, countInStock: 40, tags: ["fitness", "wearable", "health"] },
  { name: "Mechanical Gaming Keyboard", description: "RGB backlit mechanical keyboard with hot-swappable switches, built for competitive gaming and fast typing.", category: "Electronics", brand: "KeyForge", price: 89.99, countInStock: 60, tags: ["gaming", "keyboard", "rgb"] },
  { name: "Organic Cotton T-Shirt", description: "Soft, breathable everyday t-shirt made from 100% organic cotton, available in classic colors.", category: "Clothing", brand: "EarthWear", price: 24.99, countInStock: 120, tags: ["casual", "organic", "basics"] },
  { name: "Men's Running Shoes", description: "Lightweight running shoes with responsive cushioning and breathable mesh upper for daily training runs.", category: "Footwear", brand: "StrideX", price: 79.99, countInStock: 55, tags: ["running", "sports", "shoes"] },
  { name: "Stainless Steel French Press", description: "Double-walled insulated French press for brewing rich, full-flavored coffee at home or the office.", category: "Home & Kitchen", brand: "BrewCraft", price: 34.5, countInStock: 70, tags: ["coffee", "kitchen", "brewing"] },
  { name: "Ceramic Non-Stick Frying Pan", description: "Scratch-resistant ceramic-coated frying pan that heats evenly and is safe for all stovetops, including induction.", category: "Home & Kitchen", brand: "ChefLine", price: 42.0, countInStock: 45, tags: ["cookware", "kitchen", "nonstick"] },
  { name: "Leather Laptop Backpack", description: "Water-resistant leather backpack with padded laptop compartment, ideal for commuting and business travel.", category: "Accessories", brand: "UrbanCarry", price: 65.0, countInStock: 30, tags: ["bag", "travel", "leather"] },
  { name: "Yoga Mat with Carry Strap", description: "Extra-thick non-slip yoga mat made from eco-friendly TPE material, includes a carrying strap.", category: "Sports & Outdoors", brand: "ZenFlex", price: 29.99, countInStock: 80, tags: ["yoga", "fitness", "eco-friendly"] },
  { name: "Portable Bluetooth Speaker", description: "Compact waterproof speaker with deep bass, 12-hour battery, and rugged design for outdoor adventures.", category: "Electronics", brand: "SoundWave", price: 59.99, countInStock: 65, tags: ["audio", "bluetooth", "outdoor"] },
  { name: "Stainless Steel Water Bottle", description: "Vacuum-insulated bottle that keeps drinks cold for 24 hours or hot for 12, leak-proof lid included.", category: "Sports & Outdoors", brand: "HydroPro", price: 22.0, countInStock: 100, tags: ["hydration", "outdoor", "reusable"] },
  { name: "Women's Denim Jacket", description: "Classic fitted denim jacket with button closure, perfect for layering in any season.", category: "Clothing", brand: "UrbanThread", price: 54.99, countInStock: 38, tags: ["denim", "casual", "outerwear"] },
  { name: "4K Ultra HD Action Camera", description: "Waterproof action camera with image stabilization, perfect for capturing adventures in stunning 4K.", category: "Electronics", brand: "VistaCam", price: 129.0, countInStock: 20, tags: ["camera", "adventure", "4k"] },
  { name: "Memory Foam Pillow", description: "Ergonomic contour pillow made from cooling gel-infused memory foam for better neck support and sleep.", category: "Home & Kitchen", brand: "DreamRest", price: 39.99, countInStock: 90, tags: ["sleep", "bedding", "comfort"] },
  { name: "Stainless Steel Chef Knife", description: "Professional-grade 8-inch chef knife with a razor-sharp edge and ergonomic handle for precision cutting.", category: "Home & Kitchen", brand: "ChefLine", price: 48.0, countInStock: 35, tags: ["kitchen", "knife", "cooking"] },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected. Seeding data...");
  console.log(`Embeddings source: ${usingRealEmbeddings() ? "OpenAI API" : "local fallback (no OPENAI_API_KEY set)"}`);

  await User.deleteMany();
  await Product.deleteMany();

  await User.create([
    { name: "Admin User", email: "admin@example.com", password: "admin123", role: "admin" },
    { name: "Demo Customer", email: "demo@example.com", password: "demo1234", role: "customer" },
  ]);

  for (const p of products) {
    const embedding = await generateEmbedding(
      [p.name, p.description, p.category, p.tags.join(" ")].join(" ")
    );
    await Product.create({ ...p, embedding });
    console.log(`Seeded: ${p.name}`);
  }

  console.log("\nSeed complete.");
  console.log("Admin login:  admin@example.com / admin123");
  console.log("Demo login:   demo@example.com / demo1234");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
