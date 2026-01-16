const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const productsPath = path.join(process.cwd(), "data", "products.json");

const getProductsFromFile = () => {
  const data = fs.readFileSync(productsPath, "utf-8");
  return JSON.parse(data);
};


// Get all Products
router.get("/", (req, res) => {
  try {
    let products = getProductsFromFile();

    const {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      rating,
      sort = "newest",
      order = "asc",
      page = 1,
      limit = 9,
    } = req.query;

    if (search) {
      products = products.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category && category !== "All Products") {
      products = products.filter(p => p.category === category);
    }

    if (brand) {
      products = products.filter(p => p.brand === brand);
    }

    if (minPrice || maxPrice) {
      products = products.filter(p =>
        (!minPrice || p.price >= minPrice) &&
        (!maxPrice || p.price <= maxPrice)
      );
    }

    if (rating) {
      products = products.filter(p => p.rating >= rating);
    }

    if (sort === "newest") {
      products = [...products].reverse(); 
    }

    if (sort && sort !== "newest") {
      products.sort((a, b) =>
        order === "desc" ? b[sort] - a[sort] : a[sort] - b[sort]
      );
    }

    const start = (page - 1) * limit;
    const paginated = products.slice(start, start + Number(limit));

    res.json({
      products: paginated,
      total: products.length,
      page: Number(page),
      totalPages: Math.ceil(products.length / limit),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// GET SINGLE PRODUCT BY ID 

router.get("/:id", (req, res) => {
  try {
    const products = getProductsFromFile();
    const id = Number(req.params.id);

    const product = products.find(p => p.id === id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ADD PRODUCT

router.post("/", (req, res) => {
  try {
    const products = getProductsFromFile();

    const newProduct = {
      id: Date.now(),
      title: req.body.title,
      price: Number(req.body.price),
      category: req.body.category,
      brand: req.body.brand,
      rating: Number(req.body.rating) || 0,
      stock: Number(req.body.stock) || 0,
      image: req.body.image || "",
    };

    if (!newProduct.title || !newProduct.price) {
      return res.status(400).json({
        message: "Title and price are required"
      });
    }

    products.push(newProduct);

    fs.writeFileSync(
      productsPath,
      JSON.stringify(products, null, 2)
    );

    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
