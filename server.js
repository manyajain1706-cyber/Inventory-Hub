const express = require("express");
const path = require("path");
const fs = require("fs/promises");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "inventory.json");

app.use(express.json({ limit: "100kb" }));
app.use(express.static(path.join(__dirname, "public")));

const starterItems = [
  { id: 1, name: "Wireless Mouse", sku: "ACC-001", category: "Accessories", quantity: 42, price: 599, updatedAt: new Date().toISOString() },
  { id: 2, name: "Mechanical Keyboard", sku: "ACC-002", category: "Accessories", quantity: 18, price: 2499, updatedAt: new Date().toISOString() },
  { id: 3, name: "USB-C Hub", sku: "ACC-003", category: "Accessories", quantity: 7, price: 1499, updatedAt: new Date().toISOString() },
  { id: 4, name: "27-inch Monitor", sku: "DIS-001", category: "Displays", quantity: 12, price: 15999, updatedAt: new Date().toISOString() },
  { id: 5, name: "Laptop Stand", sku: "OFF-001", category: "Office", quantity: 4, price: 899, updatedAt: new Date().toISOString() },
  { id: 6, name: "Webcam HD", sku: "ACC-004", category: "Accessories", quantity: 0, price: 1999, updatedAt: new Date().toISOString() }
];

async function ensureDataFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify(starterItems, null, 2));
  }
}

async function readItems() {
  await ensureDataFile();
  return JSON.parse(await fs.readFile(DATA_FILE, "utf8"));
}

async function writeItems(items) {
  await fs.writeFile(DATA_FILE, JSON.stringify(items, null, 2));
}

function apiError(res, status, message, details = undefined) {
  return res.status(status).json({
    success: false,
    error: { message, ...(details ? { details } : {}) }
  });
}

function validateItem(body, items, excludeId = null) {
  const errors = {};
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const sku = typeof body.sku === "string" ? body.sku.trim().toUpperCase() : "";
  const category = typeof body.category === "string" ? body.category.trim() : "";
  const quantity = Number(body.quantity);
  const price = Number(body.price);

  if (!name) errors.name = "Name is required.";
  else if (name.length > 80) errors.name = "Name must be 80 characters or fewer.";
  if (!sku) errors.sku = "SKU is required.";
  else if (!/^[A-Z0-9-]{2,20}$/.test(sku)) errors.sku = "Use 2–20 letters, numbers, or hyphens.";
  else if (items.some(item => item.sku.toUpperCase() === sku && item.id !== excludeId)) errors.sku = "SKU already exists.";
  if (!category) errors.category = "Category is required.";
  if (!Number.isInteger(quantity) || quantity < 0) errors.quantity = "Quantity must be a whole number of 0 or more.";
  if (!Number.isFinite(price) || price < 0) errors.price = "Price must be a number of 0 or more.";

  return {
    errors,
    item: { name, sku, category, quantity, price }
  };
}

app.get("/api/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok", service: "InventoryHub API" } });
});

app.get("/api/items", async (req, res, next) => {
  try {
    let items = await readItems();
    const search = String(req.query.search || "").trim().toLowerCase();
    const category = String(req.query.category || "").trim();
    const status = String(req.query.status || "").trim();

    if (search) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(search) ||
        item.sku.toLowerCase().includes(search) ||
        item.category.toLowerCase().includes(search)
      );
    }
    if (category && category !== "All") items = items.filter(item => item.category === category);
    if (status === "low") items = items.filter(item => item.quantity > 0 && item.quantity <= 5);
    if (status === "out") items = items.filter(item => item.quantity === 0);
    if (status === "in") items = items.filter(item => item.quantity > 5);

    items.sort((a, b) => a.name.localeCompare(b.name));
    res.json({ success: true, data: items, meta: { count: items.length } });
  } catch (error) {
    next(error);
  }
});

app.get("/api/items/:id", async (req, res, next) => {
  try {
    const item = (await readItems()).find(entry => entry.id === Number(req.params.id));
    if (!item) return apiError(res, 404, "Inventory item not found.");
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
});

app.get("/api/summary", async (_req, res, next) => {
  try {
    const items = await readItems();
    const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);
    const inventoryValue = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const lowStock = items.filter(item => item.quantity > 0 && item.quantity <= 5).length;
    const outOfStock = items.filter(item => item.quantity === 0).length;
    res.json({
      success: true,
      data: {
        productCount: items.length,
        totalUnits,
        inventoryValue,
        lowStock,
        outOfStock
      }
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/items", async (req, res, next) => {
  try {
    const items = await readItems();
    const { errors, item } = validateItem(req.body || {}, items);
    if (Object.keys(errors).length) return apiError(res, 400, "Please correct the highlighted fields.", errors);
    const created = { id: items.reduce((max, entry) => Math.max(max, entry.id), 0) + 1, ...item, updatedAt: new Date().toISOString() };
    items.push(created);
    await writeItems(items);
    res.status(201).json({ success: true, data: created, message: "Inventory item created." });
  } catch (error) {
    next(error);
  }
});

app.put("/api/items/:id", async (req, res, next) => {
  try {
    const items = await readItems();
    const id = Number(req.params.id);
    const index = items.findIndex(entry => entry.id === id);
    if (index < 0) return apiError(res, 404, "Inventory item not found.");
    const { errors, item } = validateItem(req.body || {}, items, id);
    if (Object.keys(errors).length) return apiError(res, 400, "Please correct the highlighted fields.", errors);
    items[index] = { id, ...item, updatedAt: new Date().toISOString() };
    await writeItems(items);
    res.json({ success: true, data: items[index], message: "Inventory item updated." });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/items/:id", async (req, res, next) => {
  try {
    const items = await readItems();
    const id = Number(req.params.id);
    const index = items.findIndex(entry => entry.id === id);
    if (index < 0) return apiError(res, 404, "Inventory item not found.");
    const [deleted] = items.splice(index, 1);
    await writeItems(items);
    res.json({ success: true, data: deleted, message: "Inventory item deleted." });
  } catch (error) {
    next(error);
  }
});

app.use("/api", (_req, res) => apiError(res, 404, "API endpoint not found."));

app.use((error, _req, res, _next) => {
  console.error("API error:", error.message);
  res.status(500).json({
    success: false,
    error: { message: "An unexpected server error occurred. Please try again." }
  });
});

app.listen(PORT, () => {
  console.log(`InventoryHub is running at http://localhost:${PORT}`);
});