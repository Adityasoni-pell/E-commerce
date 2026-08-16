import express from "express";
import { semanticSearch, similarProducts } from "../controllers/searchController.js";

const router = express.Router();
router.get("/", semanticSearch);
router.get("/similar/:id", similarProducts);

export default router;
