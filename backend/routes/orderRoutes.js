import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);
router.post("/", createOrder);
router.get("/mine", getMyOrders);
router.get("/", admin, getAllOrders);
router.get("/:id", getOrderById);
router.put("/:id/status", admin, updateOrderStatus);

export default router;
