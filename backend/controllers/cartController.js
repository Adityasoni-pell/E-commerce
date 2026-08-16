import asyncHandler from "express-async-handler";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// @route GET /api/cart
export const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
  res.json(cart);
});

// @route POST /api/cart  { productId, qty }
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, qty = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });

  const existing = cart.items.find((i) => i.product.toString() === productId);
  if (existing) {
    existing.qty += Number(qty);
  } else {
    cart.items.push({
      product: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      qty: Number(qty),
    });
  }

  await cart.save();
  res.status(201).json(cart);
});

// @route PUT /api/cart/:productId  { qty }
export const updateCartItem = asyncHandler(async (req, res) => {
  const { qty } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }
  const item = cart.items.find((i) => i.product.toString() === req.params.productId);
  if (!item) {
    res.status(404);
    throw new Error("Item not in cart");
  }
  item.qty = Number(qty);
  await cart.save();
  res.json(cart);
});

// @route DELETE /api/cart/:productId
export const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }
  cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
  await cart.save();
  res.json(cart);
});

// @route DELETE /api/cart
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = [];
    await cart.save();
  }
  res.json({ message: "Cart cleared" });
});
