import { getDb, nowIso } from "./db";
import type { AdminUser } from "./types";

export const PAGE_SIZE = 10;
const NEAR_EXPIRY_DAYS = 30;

export type ProductRow = {
  product_id: number;
  product_name: string;
  generic_name: string | null;
  category: string | null;
  unit_price: number;
  stock_quantity: number;
  barcode: string | null;
  description: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
  reorder_level: number;
};

export type InventoryRow = {
  inventory_id: number;
  product_id: number;
  product_name: string;
  stock_quantity: number;
  expiry_date: string | null;
  batch_number: string | null;
  reorder_level: number;
  updated_at: string;
};

export type SaleRow = {
  sale_id: number;
  customer_id: string | null;
  user_id: number;
  cashier_name: string;
  sale_date: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  receipt_no: string;
};

export type SaleItemRow = {
  sale_item_id: number;
  sale_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
};

export type AuditRow = {
  log_id: number;
  user_id: number | null;
  username: string | null;
  full_name: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  description: string | null;
  created_at: string;
};

function like(term: string) {
  return `%${term.replace(/[%_]/g, "\\$&")}%`;
}

export function writeAudit(input: {
  userId: number | null;
  action: string;
  tableName: string;
  recordId?: string | number | null;
  description: string;
}) {
  getDb()
    .prepare(
      `INSERT INTO AUDIT_LOGS (user_id, action, table_name, record_id, description, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(
      input.userId,
      input.action,
      input.tableName,
      input.recordId == null ? null : String(input.recordId),
      input.description,
      nowIso(),
    );
}

export function getDashboardData() {
  const db = getDb();
  const totalUsers = (db.prepare("SELECT COUNT(*) AS c FROM USERS").get() as { c: number }).c;
  const activeProducts = (
    db.prepare("SELECT COUNT(*) AS c FROM PRODUCTS WHERE is_active = 1").get() as { c: number }
  ).c;
  const totalSales = (db.prepare("SELECT COUNT(*) AS c FROM SALES").get() as { c: number }).c;
  const revenue = (
    db
      .prepare(
        `SELECT COALESCE(SUM(total_amount), 0) AS t FROM SALES WHERE lower(payment_status) IN ('paid', 'completed')`,
      )
      .get() as { t: number }
  ).t;
  const pendingRevenue = (
    db.prepare("SELECT COALESCE(SUM(total_amount), 0) AS t FROM SALES").get() as { t: number }
  ).t;

  const lowStock = (
    db
      .prepare(
        `SELECT COUNT(*) AS c FROM PRODUCTS p
         WHERE p.is_active = 1
           AND p.stock_quantity > 0
           AND p.stock_quantity <= COALESCE(
             (SELECT MIN(i.reorder_level) FROM INVENTORY i WHERE i.product_id = p.product_id),
             10
           )`,
      )
      .get() as { c: number }
  ).c;

  const outOfStock = (
    db
      .prepare("SELECT COUNT(*) AS c FROM PRODUCTS WHERE is_active = 1 AND stock_quantity <= 0")
      .get() as { c: number }
  ).c;

  const expiryAlerts = (
    db
      .prepare(
        `SELECT COUNT(*) AS c FROM INVENTORY
         WHERE stock_quantity > 0
           AND expiry_date IS NOT NULL
           AND date(expiry_date) <= date('now', '+${NEAR_EXPIRY_DAYS} days')`,
      )
      .get() as { c: number }
  ).c;

  const salesByDay = db
    .prepare(
      `SELECT date(sale_date) AS day, COALESCE(SUM(total_amount), 0) AS total, COUNT(*) AS count
       FROM SALES
       WHERE date(sale_date) >= date('now', '-13 days')
       GROUP BY date(sale_date)
       ORDER BY day ASC`,
    )
    .all() as Array<{ day: string; total: number; count: number }>;

  const recentSales = db
    .prepare(
      `SELECT s.sale_id, s.customer_id, s.user_id, u.full_name AS cashier_name, s.sale_date,
              s.total_amount, s.payment_method, s.payment_status, s.receipt_no
       FROM SALES s
       JOIN USERS u ON u.id = s.user_id
       ORDER BY s.sale_date DESC, s.sale_id DESC
       LIMIT 8`,
    )
    .all() as SaleRow[];

  const lowStockList = db
    .prepare(
      `SELECT p.*, COALESCE((SELECT MIN(i.reorder_level) FROM INVENTORY i WHERE i.product_id = p.product_id), 10) AS reorder_level
       FROM PRODUCTS p
       WHERE p.is_active = 1
         AND p.stock_quantity <= COALESCE(
           (SELECT MIN(i.reorder_level) FROM INVENTORY i WHERE i.product_id = p.product_id),
           10
         )
       ORDER BY p.stock_quantity ASC, p.product_name ASC
       LIMIT 8`,
    )
    .all() as ProductRow[];

  const expiryList = db
    .prepare(
      `SELECT i.inventory_id, i.product_id, p.product_name, i.stock_quantity, i.expiry_date,
              i.batch_number, i.reorder_level, i.updated_at
       FROM INVENTORY i
       JOIN PRODUCTS p ON p.product_id = i.product_id
       WHERE i.stock_quantity > 0
         AND i.expiry_date IS NOT NULL
         AND date(i.expiry_date) <= date('now', '+${NEAR_EXPIRY_DAYS} days')
       ORDER BY date(i.expiry_date) ASC
       LIMIT 8`,
    )
    .all() as InventoryRow[];

  const recentAudit = db
    .prepare(
      `SELECT l.log_id, l.user_id, u.username, u.full_name, l.action, l.table_name, l.record_id, l.description, l.created_at
       FROM AUDIT_LOGS l
       LEFT JOIN USERS u ON u.id = l.user_id
       ORDER BY l.created_at DESC, l.log_id DESC
       LIMIT 8`,
    )
    .all() as AuditRow[];

  return {
    totalUsers,
    activeProducts,
    totalSales,
    revenue: pendingRevenue,
    paidRevenue: revenue,
    lowStock,
    outOfStock,
    expiryAlerts,
    salesByDay,
    recentSales,
    lowStockList,
    expiryList,
    recentAudit,
  };
}

export function getStaffDeskData(userId: number) {
  const dashboard = getDashboardData();
  const db = getDb();
  const today = db
    .prepare(
      `SELECT COUNT(*) AS count, COALESCE(SUM(total_amount), 0) AS total
       FROM SALES
       WHERE date(sale_date) = date('now')`,
    )
    .get() as { count: number; total: number };
  const myToday = db
    .prepare(
      `SELECT COUNT(*) AS count, COALESCE(SUM(total_amount), 0) AS total
       FROM SALES
       WHERE user_id = ? AND date(sale_date) = date('now')`,
    )
    .get(userId) as { count: number; total: number };

  return {
    activeProducts: dashboard.activeProducts,
    lowStock: dashboard.lowStock,
    outOfStock: dashboard.outOfStock,
    expiryAlerts: dashboard.expiryAlerts,
    lowStockList: dashboard.lowStockList,
    expiryList: dashboard.expiryList,
    recentSales: dashboard.recentSales,
    todayCount: today.count,
    todayTotal: today.total,
    myTodayCount: myToday.count,
    myTodayTotal: myToday.total,
  };
}

export function listUsers(filters: {
  q?: string;
  role?: string;
  status?: string;
  page?: number;
}) {
  const db = getDb();
  const clauses: string[] = ["1=1"];
  const params: unknown[] = [];
  if (filters.q?.trim()) {
    clauses.push(
      "(lower(username) LIKE lower(?) OR lower(full_name) LIKE lower(?) OR lower(COALESCE(email,'')) LIKE lower(?))",
    );
    const term = like(filters.q.trim());
    params.push(term, term, term);
  }
  if (filters.role && filters.role !== "all") {
    clauses.push("lower(role) = lower(?)");
    params.push(filters.role);
  }
  if (filters.status === "active") clauses.push("is_active = 1");
  if (filters.status === "inactive") clauses.push("is_active = 0");

  const where = clauses.join(" AND ");
  const total = (
    db.prepare(`SELECT COUNT(*) AS c FROM USERS WHERE ${where}`).get(...params) as { c: number }
  ).c;
  const page = Math.max(1, filters.page ?? 1);
  const offset = (page - 1) * PAGE_SIZE;
  const rows = db
    .prepare(
      `SELECT id, username, full_name, role, email, phone, is_active, created_at, updated_at
       FROM USERS WHERE ${where}
       ORDER BY created_at DESC, id DESC
       LIMIT ? OFFSET ?`,
    )
    .all(...params, PAGE_SIZE, offset) as AdminUser[];
  return { rows, total, page, pageSize: PAGE_SIZE };
}

export function getUser(id: number) {
  return getDb()
    .prepare(
      `SELECT id, username, full_name, role, email, phone, is_active, created_at, updated_at
       FROM USERS WHERE id = ?`,
    )
    .get(id) as AdminUser | undefined;
}

export function listProducts(filters: {
  q?: string;
  category?: string;
  status?: string;
  stock?: string;
  page?: number;
}) {
  const db = getDb();
  const clauses: string[] = ["1=1"];
  const params: unknown[] = [];
  if (filters.q?.trim()) {
    const term = like(filters.q.trim());
    clauses.push(
      "(lower(p.product_name) LIKE lower(?) OR lower(COALESCE(p.generic_name,'')) LIKE lower(?) OR lower(COALESCE(p.barcode,'')) LIKE lower(?))",
    );
    params.push(term, term, term);
  }
  if (filters.category && filters.category !== "all") {
    clauses.push("p.category = ?");
    params.push(filters.category);
  }
  if (filters.status === "active") clauses.push("p.is_active = 1");
  if (filters.status === "inactive") clauses.push("p.is_active = 0");
  if (filters.stock === "low") {
    clauses.push(
      `p.stock_quantity > 0 AND p.stock_quantity <= COALESCE((SELECT MIN(i.reorder_level) FROM INVENTORY i WHERE i.product_id = p.product_id), 10)`,
    );
  }
  if (filters.stock === "out") clauses.push("p.stock_quantity <= 0");

  const where = clauses.join(" AND ");
  const total = (
    db.prepare(`SELECT COUNT(*) AS c FROM PRODUCTS p WHERE ${where}`).get(...params) as { c: number }
  ).c;
  const page = Math.max(1, filters.page ?? 1);
  const rows = db
    .prepare(
      `SELECT p.*, COALESCE((SELECT MIN(i.reorder_level) FROM INVENTORY i WHERE i.product_id = p.product_id), 10) AS reorder_level
       FROM PRODUCTS p
       WHERE ${where}
       ORDER BY p.product_name ASC
       LIMIT ? OFFSET ?`,
    )
    .all(...params, PAGE_SIZE, (page - 1) * PAGE_SIZE) as ProductRow[];
  return { rows, total, page, pageSize: PAGE_SIZE };
}

export function getProduct(id: number) {
  return getDb()
    .prepare(
      `SELECT p.*, COALESCE((SELECT MIN(i.reorder_level) FROM INVENTORY i WHERE i.product_id = p.product_id), 10) AS reorder_level
       FROM PRODUCTS p WHERE p.product_id = ?`,
    )
    .get(id) as ProductRow | undefined;
}

export function getProductBatches(productId: number) {
  return getDb()
    .prepare(
      `SELECT i.inventory_id, i.product_id, p.product_name, i.stock_quantity, i.expiry_date,
              i.batch_number, i.reorder_level, i.updated_at
       FROM INVENTORY i
       JOIN PRODUCTS p ON p.product_id = i.product_id
       WHERE i.product_id = ?
       ORDER BY date(i.expiry_date) ASC`,
    )
    .all(productId) as InventoryRow[];
}

export function productCategories() {
  return getDb()
    .prepare(
      `SELECT DISTINCT category FROM PRODUCTS WHERE category IS NOT NULL AND category != '' ORDER BY category`,
    )
    .all() as Array<{ category: string }>;
}

export function listSales(filters: {
  q?: string;
  from?: string;
  to?: string;
  status?: string;
  page?: number;
}) {
  const db = getDb();
  const clauses: string[] = ["1=1"];
  const params: unknown[] = [];
  if (filters.q?.trim()) {
    const term = like(filters.q.trim());
    clauses.push(
      "(lower(s.receipt_no) LIKE lower(?) OR lower(COALESCE(s.customer_id,'')) LIKE lower(?) OR lower(u.full_name) LIKE lower(?))",
    );
    params.push(term, term, term);
  }
  if (filters.from) {
    clauses.push("date(s.sale_date) >= date(?)");
    params.push(filters.from);
  }
  if (filters.to) {
    clauses.push("date(s.sale_date) <= date(?)");
    params.push(filters.to);
  }
  if (filters.status && filters.status !== "all") {
    clauses.push("lower(s.payment_status) = lower(?)");
    params.push(filters.status);
  }
  const where = clauses.join(" AND ");
  const total = (
    db
      .prepare(
        `SELECT COUNT(*) AS c FROM SALES s JOIN USERS u ON u.id = s.user_id WHERE ${where}`,
      )
      .get(...params) as { c: number }
  ).c;
  const page = Math.max(1, filters.page ?? 1);
  const rows = db
    .prepare(
      `SELECT s.sale_id, s.customer_id, s.user_id, u.full_name AS cashier_name, s.sale_date,
              s.total_amount, s.payment_method, s.payment_status, s.receipt_no
       FROM SALES s
       JOIN USERS u ON u.id = s.user_id
       WHERE ${where}
       ORDER BY s.sale_date DESC, s.sale_id DESC
       LIMIT ? OFFSET ?`,
    )
    .all(...params, PAGE_SIZE, (page - 1) * PAGE_SIZE) as SaleRow[];
  return { rows, total, page, pageSize: PAGE_SIZE };
}

export function getSale(id: number) {
  const sale = getDb()
    .prepare(
      `SELECT s.sale_id, s.customer_id, s.user_id, u.full_name AS cashier_name, s.sale_date,
              s.total_amount, s.payment_method, s.payment_status, s.receipt_no
       FROM SALES s
       JOIN USERS u ON u.id = s.user_id
       WHERE s.sale_id = ?`,
    )
    .get(id) as SaleRow | undefined;
  if (!sale) return null;
  const items = getDb()
    .prepare(
      `SELECT si.sale_item_id, si.sale_id, si.product_id, p.product_name, si.quantity, si.unit_price, si.subtotal
       FROM SALE_ITEMS si
       JOIN PRODUCTS p ON p.product_id = si.product_id
       WHERE si.sale_id = ?
       ORDER BY si.sale_item_id ASC`,
    )
    .all(id) as SaleItemRow[];
  return { sale, items };
}

export function listSellableProducts() {
  return getDb()
    .prepare(
      `SELECT product_id, product_name, generic_name, category, unit_price, stock_quantity, barcode, is_active
       FROM PRODUCTS
       WHERE is_active = 1
       ORDER BY product_name ASC`,
    )
    .all() as ProductRow[];
}

export function listInventory(filters: {
  q?: string;
  stock?: string;
  expiry?: string;
  page?: number;
}) {
  const db = getDb();
  const clauses: string[] = ["1=1"];
  const params: unknown[] = [];
  if (filters.q?.trim()) {
    const term = like(filters.q.trim());
    clauses.push(
      "(lower(p.product_name) LIKE lower(?) OR lower(COALESCE(i.batch_number,'')) LIKE lower(?))",
    );
    params.push(term, term);
  }
  if (filters.stock === "low") {
    clauses.push("i.stock_quantity > 0 AND i.stock_quantity <= i.reorder_level");
  }
  if (filters.stock === "out") clauses.push("i.stock_quantity <= 0");
  if (filters.expiry === "expired") {
    clauses.push("i.expiry_date IS NOT NULL AND date(i.expiry_date) < date('now')");
  }
  if (filters.expiry === "near") {
    clauses.push(
      `i.expiry_date IS NOT NULL AND date(i.expiry_date) >= date('now') AND date(i.expiry_date) <= date('now', '+${NEAR_EXPIRY_DAYS} days')`,
    );
  }
  const where = clauses.join(" AND ");
  const total = (
    db
      .prepare(
        `SELECT COUNT(*) AS c FROM INVENTORY i JOIN PRODUCTS p ON p.product_id = i.product_id WHERE ${where}`,
      )
      .get(...params) as { c: number }
  ).c;
  const page = Math.max(1, filters.page ?? 1);
  const rows = db
    .prepare(
      `SELECT i.inventory_id, i.product_id, p.product_name, i.stock_quantity, i.expiry_date,
              i.batch_number, i.reorder_level, i.updated_at
       FROM INVENTORY i
       JOIN PRODUCTS p ON p.product_id = i.product_id
       WHERE ${where}
       ORDER BY date(i.expiry_date) ASC, p.product_name ASC
       LIMIT ? OFFSET ?`,
    )
    .all(...params, PAGE_SIZE, (page - 1) * PAGE_SIZE) as InventoryRow[];
  return { rows, total, page, pageSize: PAGE_SIZE };
}

export function getInventoryBatch(id: number) {
  return getDb()
    .prepare(
      `SELECT i.inventory_id, i.product_id, p.product_name, i.stock_quantity, i.expiry_date,
              i.batch_number, i.reorder_level, i.updated_at
       FROM INVENTORY i
       JOIN PRODUCTS p ON p.product_id = i.product_id
       WHERE i.inventory_id = ?`,
    )
    .get(id) as InventoryRow | undefined;
}

export function listAudit(filters: {
  q?: string;
  userId?: string;
  action?: string;
  from?: string;
  to?: string;
  page?: number;
}) {
  const db = getDb();
  const clauses: string[] = ["1=1"];
  const params: unknown[] = [];
  if (filters.q?.trim()) {
    const term = like(filters.q.trim());
    clauses.push(
      "(lower(l.action) LIKE lower(?) OR lower(l.table_name) LIKE lower(?) OR lower(COALESCE(l.description,'')) LIKE lower(?) OR lower(COALESCE(l.record_id,'')) LIKE lower(?))",
    );
    params.push(term, term, term, term);
  }
  if (filters.userId && filters.userId !== "all") {
    clauses.push("l.user_id = ?");
    params.push(Number(filters.userId));
  }
  if (filters.action && filters.action !== "all") {
    clauses.push("lower(l.action) = lower(?)");
    params.push(filters.action);
  }
  if (filters.from) {
    clauses.push("date(l.created_at) >= date(?)");
    params.push(filters.from);
  }
  if (filters.to) {
    clauses.push("date(l.created_at) <= date(?)");
    params.push(filters.to);
  }
  const where = clauses.join(" AND ");
  const total = (
    db
      .prepare(
        `SELECT COUNT(*) AS c FROM AUDIT_LOGS l LEFT JOIN USERS u ON u.id = l.user_id WHERE ${where}`,
      )
      .get(...params) as { c: number }
  ).c;
  const page = Math.max(1, filters.page ?? 1);
  const rows = db
    .prepare(
      `SELECT l.log_id, l.user_id, u.username, u.full_name, l.action, l.table_name, l.record_id, l.description, l.created_at
       FROM AUDIT_LOGS l
       LEFT JOIN USERS u ON u.id = l.user_id
       WHERE ${where}
       ORDER BY l.created_at DESC, l.log_id DESC
       LIMIT ? OFFSET ?`,
    )
    .all(...params, PAGE_SIZE, (page - 1) * PAGE_SIZE) as AuditRow[];
  const users = db
    .prepare("SELECT id, full_name, username FROM USERS ORDER BY full_name")
    .all() as Array<{ id: number; full_name: string; username: string }>;
  const actions = db
    .prepare("SELECT DISTINCT action FROM AUDIT_LOGS ORDER BY action")
    .all() as Array<{ action: string }>;
  return { rows, total, page, pageSize: PAGE_SIZE, users, actions };
}

export function getReports(filters: { from?: string; to?: string }) {
  const db = getDb();
  const from = filters.from || "1970-01-01";
  const to = filters.to || nowIso().slice(0, 10);
  const dateClause = "date(s.sale_date) >= date(?) AND date(s.sale_date) <= date(?)";

  const summary = db
    .prepare(
      `SELECT COUNT(*) AS transactions, COALESCE(SUM(total_amount), 0) AS revenue
       FROM SALES s WHERE ${dateClause}`,
    )
    .get(from, to) as { transactions: number; revenue: number };

  const byStatus = db
    .prepare(
      `SELECT payment_status, COUNT(*) AS count, COALESCE(SUM(total_amount), 0) AS total
       FROM SALES s WHERE ${dateClause}
       GROUP BY payment_status
       ORDER BY total DESC`,
    )
    .all(from, to) as Array<{ payment_status: string; count: number; total: number }>;

  const byStaff = db
    .prepare(
      `SELECT u.id, u.full_name, COUNT(*) AS count, COALESCE(SUM(s.total_amount), 0) AS total
       FROM SALES s
       JOIN USERS u ON u.id = s.user_id
       WHERE ${dateClause}
       GROUP BY u.id, u.full_name
       ORDER BY total DESC`,
    )
    .all(from, to) as Array<{ id: number; full_name: string; count: number; total: number }>;

  const bestSellers = db
    .prepare(
      `SELECT p.product_id, p.product_name, SUM(si.quantity) AS qty, SUM(si.subtotal) AS total
       FROM SALE_ITEMS si
       JOIN SALES s ON s.sale_id = si.sale_id
       JOIN PRODUCTS p ON p.product_id = si.product_id
       WHERE ${dateClause}
       GROUP BY p.product_id, p.product_name
       ORDER BY qty DESC
       LIMIT 15`,
    )
    .all(from, to) as Array<{ product_id: number; product_name: string; qty: number; total: number }>;

  const stockLevels = db
    .prepare(
      `SELECT product_id, product_name, category, stock_quantity, unit_price, is_active
       FROM PRODUCTS
       ORDER BY stock_quantity ASC, product_name ASC`,
    )
    .all() as Array<{
    product_id: number;
    product_name: string;
    category: string | null;
    stock_quantity: number;
    unit_price: number;
    is_active: number;
  }>;

  const lowStock = db
    .prepare(
      `SELECT p.product_id, p.product_name, p.stock_quantity,
              COALESCE((SELECT MIN(i.reorder_level) FROM INVENTORY i WHERE i.product_id = p.product_id), 10) AS reorder_level
       FROM PRODUCTS p
       WHERE p.is_active = 1
         AND p.stock_quantity <= COALESCE((SELECT MIN(i.reorder_level) FROM INVENTORY i WHERE i.product_id = p.product_id), 10)
       ORDER BY p.stock_quantity ASC`,
    )
    .all() as ProductRow[];

  const expiry = db
    .prepare(
      `SELECT i.inventory_id, i.product_id, p.product_name, i.stock_quantity, i.expiry_date,
              i.batch_number, i.reorder_level, i.updated_at
       FROM INVENTORY i
       JOIN PRODUCTS p ON p.product_id = i.product_id
       WHERE i.stock_quantity > 0
         AND i.expiry_date IS NOT NULL
         AND date(i.expiry_date) <= date('now', '+${NEAR_EXPIRY_DAYS} days')
       ORDER BY date(i.expiry_date) ASC`,
    )
    .all() as InventoryRow[];

  const adminActivity = db
    .prepare(
      `SELECT l.log_id, l.user_id, u.username, u.full_name, l.action, l.table_name, l.record_id, l.description, l.created_at
       FROM AUDIT_LOGS l
       LEFT JOIN USERS u ON u.id = l.user_id
       WHERE date(l.created_at) >= date(?) AND date(l.created_at) <= date(?)
       ORDER BY l.created_at DESC
       LIMIT 30`,
    )
    .all(from, to) as AuditRow[];

  return { from, to, summary, byStatus, byStaff, bestSellers, stockLevels, lowStock, expiry, adminActivity };
}
