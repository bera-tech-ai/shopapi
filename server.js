const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Path to products JSON file
const DATA_DIR = path.join(__dirname, 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Seed data if file doesn't exist or is empty
const seedProducts = [
  { id: 1, name: 'iPhone 15 Pro Max', price: 189000, stock: 15 },
  { id: 2, name: 'Samsung Galaxy S24 Ultra', price: 175000, stock: 20 },
  { id: 3, name: 'Sony WH-1000XM5 Headphones', price: 35000, stock: 30 },
  { id: 4, name: 'MacBook Air M3', price: 145000, stock: 10 },
  { id: 5, name: 'Nike Air Max 270 React', price: 18000, stock: 50 }
];

function loadProducts() {
  try {
    const data = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
    if (!data.trim()) {
      // File is empty, seed it
      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(seedProducts, null, 2), 'utf-8');
      return seedProducts;
    }
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      // File doesn't exist, create with seed data
      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(seedProducts, null, 2), 'utf-8');
      return seedProducts;
    }
    throw err;
  }
}

function saveProducts(products) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');
}

// Load products at startup
let products = loadProducts();

// Helper to find product by id
function findProductById(id) {
  return products.find(p => p.id === id);
}

// GET / - API status
app.get('/', (req, res) => {
  res.json({ name: 'ShopAPI', version: '1.0.0' });
});

// GET /api/products - list all
app.get('/api/products', (req, res) => {
  res.json(products);
});

// GET /api/products/search?q= - search by name (case-insensitive)
app.get('/api/products/search', (req, res) => {
  const query = (req.query.q || '').toLowerCase().trim();
  if (!query) {
    return res.json([]);
  }
  const filtered = products.filter(p => p.name.toLowerCase().includes(query));
  res.json(filtered);
});

// GET /api/products/:id - get one product
app.get('/api/products/:id', (req, res) => {
  const id = Number(req.params.id);
  const product = findProductById(id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// POST /api/products - create a new product
app.post('/api/products', (req, res) => {
  const { name, price, stock } = req.body;

  // Validate required fields
  if (!name || price === undefined || stock === undefined) {
    return res.status(400).json({ error: 'name, price, and stock are required' });
  }
  if (typeof price !== 'number' || typeof stock !== 'number') {
    return res.status(400).json({ error: 'price and stock must be numbers' });
  }

  // Generate new id
  const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
  const newProduct = { id: newId, name, price, stock };
  products.push(newProduct);

  try {
    saveProducts(products);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to save product' });
  }

  res.status(201).json(newProduct);
});

// PUT /api/products/:id - update a product
app.put('/api/products/:id', (req, res) => {
  const id = Number(req.params.id);
  const product = findProductById(id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const { name, price, stock } = req.body;

  // Update fields if provided; validate price and stock types
  if (name !== undefined) product.name = name;
  if (price !== undefined) {
    if (typeof price !== 'number') {
      return res.status(400).json({ error: 'price must be a number' });
    }
    product.price = price;
  }
  if (stock !== undefined) {
    if (typeof stock !== 'number') {
      return res.status(400).json({ error: 'stock must be a number' });
    }
    product.stock = stock;
  }

  try {
    saveProducts(products);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update product' });
  }

  res.json(product);
});

// DELETE /api/products/:id - remove a product
app.delete('/api/products/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = products.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  products.splice(index, 1);

  try {
    saveProducts(products);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete product' });
  }

  res.status(204).send();
});

// Error handling middleware (last resort)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`ShopAPI server running on port ${PORT}`);
});