const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---------- Data helpers ----------
const PRODUCTS_PATH = path.join(__dirname, 'data', 'products.json');
const ORDERS_PATH = path.join(__dirname, 'data', 'orders.json');

function loadProducts() {
  const raw = fs.readFileSync(PRODUCTS_PATH, 'utf-8');
  return JSON.parse(raw);
}

function loadOrders() {
  if (!fs.existsSync(ORDERS_PATH)) return [];
  const raw = fs.readFileSync(ORDERS_PATH, 'utf-8');
  return raw.trim() ? JSON.parse(raw) : [];
}

function saveOrders(orders) {
  fs.writeFileSync(ORDERS_PATH, JSON.stringify(orders, null, 2));
}

function generateOrderId() {
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `SN${Date.now().toString().slice(-6)}${rand}`;
}

// ---------- Product routes ----------
app.get('/api/products', (req, res) => {
  const products = loadProducts();
  const { category, search } = req.query;

  let result = products;
  if (category && category !== 'All') {
    result = result.filter(
      (p) => p.category.toLowerCase() === String(category).toLowerCase()
    );
  }
  if (search) {
    const q = String(search).toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q)
    );
  }
  res.json(result);
});

app.get('/api/products/:id', (req, res) => {
  const products = loadProducts();
  const product = products.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// ---------- Order processing ----------
app.post('/api/orders', (req, res) => {
  const { items, customer } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty. Add items before checking out.' });
  }
  if (!customer || !customer.name || !customer.phone || !customer.address) {
    return res.status(400).json({ error: 'Name, phone and address are required to place an order.' });
  }

  const products = loadProducts();
  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const product = products.find((p) => p.id === item.id);
    if (!product) {
      return res.status(400).json({ error: `Product ${item.id} no longer exists.` });
    }
    const qty = Math.max(1, parseInt(item.qty, 10) || 1);
    subtotal += product.price * qty;
    orderItems.push({
      id: product.id,
      name: product.name,
      price: product.price,
      qty,
      image: product.image
    });
  }

  const shipping = subtotal >= 1999 ? 0 : 79;
  const tax = Math.round(subtotal * 0.05); // 5% simplified tax
  const total = subtotal + shipping + tax;

  const order = {
    id: generateOrderId(),
    items: orderItems,
    customer,
    subtotal,
    shipping,
    tax,
    total,
    status: 'Confirmed',
    placedAt: new Date().toISOString(),
    eta: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString()
  };

  const orders = loadOrders();
  orders.push(order);
  saveOrders(orders);

  res.status(201).json(order);
});

app.get('/api/orders/:id', (req, res) => {
  const orders = loadOrders();
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});

// Fallback to index.html for any non-API route (simple multi-page site, so
// this mostly helps with direct refreshes on known static pages)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  const filePath = path.join(__dirname, 'public', req.path);
  if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
    return res.sendFile(filePath);
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`SN Store server running at http://localhost:${PORT}`);
});
