const express = require("express");
const { v4: uuidv4 } = require("uuid");
const config = require("../config");
const { products, addOrder, getOrdersByUser, getOrderById } = require("../data/products");

const router = express.Router();

function paginate(arr, page, limit) {
  const p = Math.max(1, parseInt(page, 10) || config.pagination.defaultPage);
  const l = Math.min(config.pagination.maxLimit, Math.max(1, parseInt(limit, 10) || config.pagination.defaultLimit));
  const start = (p - 1) * l;
  return { items: arr.slice(start, start + l), page: p, limit: l, total: arr.length, total_pages: Math.ceil(arr.length / l) };
}

function success(data, meta) {
  const res = { success: true, data };
  if (meta) res.meta = meta;
  return res;
}

function validate(body, fields) {
  const missing = fields.filter((f) => body[f] === undefined || body[f] === null || body[f] === "");
  return missing.length ? `Missing required fields: ${missing.join(", ")}` : null;
}

// GET /api/v1/health
router.get("/health", (_req, res) => {
  res.json({ success: true, data: { service: config.serviceName, status: "healthy", timestamp: new Date().toISOString(), version: "1.0.0" } });
});

// GET /api/v1/marketplace/products
router.get("/products", (req, res) => {
  let result = [...products];
  const { type, category, risk_level, min_investment_max, sort_by, search, page, limit } = req.query;

  if (type) result = result.filter((p) => p.type === type.toLowerCase());
  if (category) result = result.filter((p) => p.sub_type === category.toLowerCase());
  if (risk_level) result = result.filter((p) => p.risk_level === risk_level.toLowerCase());
  if (min_investment_max) result = result.filter((p) => p.min_investment <= parseFloat(min_investment_max));
  if (search) {
    const q = search.toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(q) || (p.ticker && p.ticker.toLowerCase().includes(q)) || p.description.toLowerCase().includes(q));
  }
  if (sort_by) {
    const parts = sort_by.split(":");
    const field = parts[0];
    const dir = parts[1] === "desc" ? -1 : 1;
    result.sort((a, b) => {
      if (a[field] === undefined) return 1;
      if (b[field] === undefined) return -1;
      return a[field] > b[field] ? dir : a[field] < b[field] ? -dir : 0;
    });
  }

  res.json(success(...Object.values(paginate(result, page, limit))));
});

// GET /api/v1/marketplace/products/:id
router.get("/products/:id", (req, res, next) => {
  const product = products.find((p) => p.id === req.params.id);
  if (!product) return next(Object.assign(new Error("Product not found"), { status: 404, code: "NOT_FOUND" }));
  res.json(success(product));
});

// GET /api/v1/marketplace/categories
router.get("/categories", (_req, res) => {
  const counts = {};
  products.forEach((p) => {
    const key = `${p.type}:${p.sub_type}`;
    if (!counts[key]) counts[key] = { type: p.type, sub_type: p.sub_type, count: 0 };
    counts[key].count++;
  });
  res.json(success(Object.values(counts)));
});

// GET /api/v1/marketplace/featured
router.get("/featured", (_req, res) => {
  const featured = products.filter((p) => p.is_featured).slice(0, 6);
  res.json(success(featured));
});

// POST /api/v1/marketplace/orders
router.post("/orders", (req, res, next) => {
  const err = validate(req.body, ["product_id", "quantity", "order_type"]);
  if (err) return next(Object.assign(new Error(err), { status: 400, code: "VALIDATION_ERROR" }));

  const product = products.find((p) => p.id === req.body.product_id);
  if (!product) return next(Object.assign(new Error("Product not found"), { status: 404, code: "NOT_FOUND" }));

  const qty = parseFloat(req.body.quantity);
  if (isNaN(qty) || qty <= 0) return next(Object.assign(new Error("quantity must be a positive number"), { status: 400, code: "VALIDATION_ERROR" }));

  const validTypes = ["buy", "sell", "subscribe"];
  if (!validTypes.includes(req.body.order_type)) return next(Object.assign(new Error(`order_type must be one of: ${validTypes.join(", ")}`), { status: 400, code: "VALIDATION_ERROR" }));

  const price = product.current_price || product.nav || 0;
  const total_amount = parseFloat((qty * price).toFixed(2));

  const order = {
    id: uuidv4(),
    user_id: req.body.user_id || "anonymous",
    product_id: product.id,
    product_name: product.name,
    product_type: product.type,
    order_type: req.body.order_type,
    quantity: qty,
    price_per_unit: price,
    total_amount: total_amount,
    status: "confirmed",
    created_at: new Date().toISOString(),
  };

  addOrder(order);
  res.status(201).json(success(order));
});

// GET /api/v1/marketplace/orders
router.get("/orders", (req, res) => {
  const userId = req.query.user_id || "anonymous";
  const result = getOrdersByUser(userId);
  res.json(success(result));
});

// GET /api/v1/marketplace/orders/:id
router.get("/orders/:id", (req, res, next) => {
  const order = getOrderById(req.params.id);
  if (!order) return next(Object.assign(new Error("Order not found"), { status: 404, code: "NOT_FOUND" }));
  res.json(success(order));
});

module.exports = router;
