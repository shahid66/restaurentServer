const express = require("express");
const { createProduct, updateProduct, getProducts, getProduct, deleteProduct } = require("../controllers/ProductController");
const { upload } = require("../helpers/fileUpload");
const { protect } = require("../middleware/AuthMiddleware");
const router = express.Router();

router.post("/product", protect, upload.single("image"), createProduct);
router.patch("/product/:id", protect, upload.single("image"), updateProduct);
router.get("/product", protect, getProducts);
router.get("/product/:id", protect, getProduct);
router.delete("/product/:id", protect, deleteProduct);

module.exports = router;