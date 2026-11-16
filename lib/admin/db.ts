import { mkdirSync, existsSync } from "fs";
import path from "path";
import { DatabaseSync } from "node:sqlite";
import { products as catalog } from "@/app/lib/products";
import { hashPassword } from "./password";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "pharmalink.db");

type GlobalDb = typeof globalThis & { __pharmalinkDb?: DatabaseSync };

function createSchema(db: DatabaseSync) {
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS USERS (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS PRODUCTS (
      product_id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_name TEXT NOT NULL,
      generic_name TEXT,
      category TEXT,
      unit_price REAL NOT NULL,
      stock_quantity INTEGER NOT NULL DEFAULT 0,
      barcode TEXT,
      description TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS SALES (
      sale_id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id TEXT,
      user_id INTEGER NOT NULL,
      sale_date TEXT NOT NULL,
      total_amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      payment_status TEXT NOT NULL,
      receipt_no TEXT NOT NULL UNIQUE,
      FOREIGN KEY (user_id) REFERENCES USERS(id)
    );

    CREATE TABLE IF NOT EXISTS SALE_ITEMS (
      sale_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      subtotal REAL NOT NULL,
      FOREIGN KEY (sale_id) REFERENCES SALES(sale_id),
      FOREIGN KEY (product_id) REFERENCES PRODUCTS(product_id)
    );

    CREATE TABLE IF NOT EXISTS INVENTORY (
      inventory_id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      stock_quantity INTEGER NOT NULL,
      expiry_date TEXT,
      batch_number TEXT,
      reorder_level INTEGER NOT NULL DEFAULT 10,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES PRODUCTS(product_id)
    );

    CREATE TABLE IF NOT EXISTS AUDIT_LOGS (
      log_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      table_name TEXT NOT NULL,
      record_id TEXT,
      description TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES USERS(id)
    );
  `);
}

function genericFromName(name: string) {
  return name.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+\d.*$/, "").trim();
}

function seedUsers(db: DatabaseSync) {
  const count = db.prepare("SELECT COUNT(*) AS c FROM USERS").get() as { c: number };
  if (count.c > 0) return;

  const now = new Date().toISOString();
  const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD || "PharmaAdmin!2026";
  const staffPassword = process.env.STAFF_BOOTSTRAP_PASSWORD || "StaffDemo!2026";

  db.prepare(
    `INSERT INTO USERS (username, password, full_name, role, email, phone, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`,
  ).run(
    "admin",
    hashPassword(adminPassword),
    "Pharmacy Administrator",
    "admin",
    "admin@301east.local",
    "09170000000",
    now,
    now,
  );

  db.prepare(
    `INSERT INTO USERS (username, password, full_name, role, email, phone, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`,
  ).run(
    "staff",
    hashPassword(staffPassword),
    "Front Desk Staff",
    "staff",
    "staff@301east.local",
    "09170000001",
    now,
    now,
  );

  db.prepare(
    `INSERT INTO AUDIT_LOGS (user_id, action, table_name, record_id, description, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(1, "SEED", "USERS", "1", "Bootstrap administrator and staff accounts created.", now);
}

function ensureUser(
  db: DatabaseSync,
  user: {
    username: string;
    password: string;
    fullName: string;
    role: string;
    email: string;
    phone: string;
  },
) {
  const exists = db.prepare("SELECT id FROM USERS WHERE lower(username) = ?").get(user.username) as
    | { id: number }
    | undefined;
  if (exists) return;
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO USERS (username, password, full_name, role, email, phone, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`,
  ).run(user.username, hashPassword(user.password), user.fullName, user.role, user.email, user.phone, now, now);
}

function ensureOperationalUsers(db: DatabaseSync) {
  ensureUser(db, {
    username: "pharmacist",
    password: process.env.PHARMACIST_BOOTSTRAP_PASSWORD || "PharmaDesk!2026",
    fullName: "Licensed Pharmacist",
    role: "pharmacist",
    email: "pharmacist@301east.local",
    phone: "09170000002",
  });
}

function seedCatalog(db: DatabaseSync) {
  const count = db.prepare("SELECT COUNT(*) AS c FROM PRODUCTS").get() as { c: number };
  if (count.c > 0) return;

  const now = new Date().toISOString();
  const insertProduct = db.prepare(
    `INSERT INTO PRODUCTS (
      product_name, generic_name, category, unit_price, stock_quantity, barcode, description, is_active, created_at, updated_at
    ) VALUES (?, ?, ?, ?, 0, ?, ?, 1, ?, ?)`,
  );
  const insertBatch = db.prepare(
    `INSERT INTO INVENTORY (product_id, stock_quantity, expiry_date, batch_number, reorder_level, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  );
  const updateStock = db.prepare(
    `UPDATE PRODUCTS SET stock_quantity = ?, updated_at = ? WHERE product_id = ?`,
  );

  catalog.forEach((product, index) => {
    const result = insertProduct.run(
      product.name,
      genericFromName(product.name),
      product.category,
      product.price,
      product.id,
      product.description,
      now,
      now,
    );
    const productId = Number(result.lastInsertRowid);

    const reorder = 10;
    let total = 0;
    const year = new Date().getFullYear();
    const month = String(((index * 3) % 12) + 1).padStart(2, "0");
    const day = String((index % 27) + 1).padStart(2, "0");

    if (index % 11 === 0) {
      const expired = `${year - 1}-${month}-${day}`;
      insertBatch.run(productId, 8, expired, `EXP-${product.id}`, reorder, now);
      total += 8;
    }

    if (index % 9 === 0) {
      const near = new Date();
      near.setDate(near.getDate() + 12);
      const qty = 6;
      insertBatch.run(
        productId,
        qty,
        near.toISOString().slice(0, 10),
        `NEAR-${product.id}`,
        reorder,
        now,
      );
      total += qty;
    }

    const mainQty = index % 7 === 0 ? 4 : 24 + (index % 20);
    const future = new Date();
    future.setMonth(future.getMonth() + 8 + (index % 6));
    insertBatch.run(
      productId,
      mainQty,
      future.toISOString().slice(0, 10),
      `B${year}${String(index + 1).padStart(3, "0")}`,
      reorder,
      now,
    );
    total += mainQty;

    updateStock.run(total, now, productId);
  });

  db.prepare(
    `INSERT INTO AUDIT_LOGS (user_id, action, table_name, record_id, description, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(
    1,
    "SEED",
    "PRODUCTS",
    String(catalog.length),
    "Catalog products and opening inventory batches were loaded into the pharmacy database.",
    now,
  );
}

function openDatabase() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  createSchema(db);
  seedUsers(db);
  ensureOperationalUsers(db);
  seedCatalog(db);
  return db;
}

export function getDb() {
  const g = globalThis as GlobalDb;
  if (!g.__pharmalinkDb) {
    g.__pharmalinkDb = openDatabase();
  }
  return g.__pharmalinkDb;
}

export function nowIso() {
  return new Date().toISOString();
}

export function syncProductStock(db: DatabaseSync, productId: number) {
  const row = db
    .prepare("SELECT COALESCE(SUM(stock_quantity), 0) AS total FROM INVENTORY WHERE product_id = ?")
    .get(productId) as { total: number };
  db.prepare("UPDATE PRODUCTS SET stock_quantity = ?, updated_at = ? WHERE product_id = ?").run(
    row.total,
    nowIso(),
    productId,
  );
  return row.total;
}
