import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// @route POST /api/orders
export const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod = "COD" } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error("Cart is empty");
  }

  // Validate stock and compute totals server-side (never trust client prices)
  let itemsPrice = 0;
  const items = [];
  for (const ci of cart.items) {
    const product = await Product.findById(ci.product);
    if (!product || product.countInStock < ci.qty) {
      res.status(400);
      throw new Error(`Insufficient stock for ${ci.name}`);
    }
    itemsPrice += product.price * ci.qty;
    items.push({
      product: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      qty: ci.qty,
    });
    product.countInStock -= ci.qty;
    await product.save();
  }

  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const taxPrice = Number((0.08 * itemsPrice).toFixed(2));
  const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

  const order = await Order.create({
    user: req.user._id,
    items,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  });

  cart.items = [];
  await cart.save();

  res.status(201).json(order);
});

// @route GET /api/orders/mine
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

// @route GET /api/orders/:id
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to view this order");
  }
  res.json(order);
});

// @route GET /api/orders (admin)
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate("user", "name email").sort({ createdAt: -1 });
  res.json(orders);
});

// @route PUT /api/orders/:id/status (admin)
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  order.status = req.body.status || order.status;
  if (req.body.status === "delivered") {
    order.isPaid = true;
    order.paidAt = new Date();
  }
  const updated = await order.save();
  res.json(updated);
});
