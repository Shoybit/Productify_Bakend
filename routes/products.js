const express = require("express");
const fs = require("fs");
const path = require("path");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
const dataPath = path.join(__dirname, "../data/products.json");

// Helper
const getProducts = () =>
  JSON.parse(fs.readFileSync(dataPath, "utf-8"));

/**
 * GET all products (Public)
 */
router.get("/", (req, res) => {
  const products = getProducts();
  res.json(products);
});

/**
 * GET single product (Public)
 */
router.get("/:id", (req, res) => {
  const products = getProducts();
  const product = products.find(
    (p) => p.id === Number(req.params.id)
  );

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.json(product);
});

/**
 * POST add product (Protected)
 */
router.post("/", authMiddleware, (req, res) => {
  const products = getProducts();
  const { name, description, price, image } = req.body;

  const newProduct = {
    id: products.length + 1,
    name,
    description,
    price,
    image
  };

  products.push(newProduct);

  fs.writeFileSync(dataPath, JSON.stringify(products, null, 2));

  res.status(201).json({
    message: "Product added successfully",
    product: newProduct
  });
});

module.exports = router;
