"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb, nowIso, syncProductStock } from "@/lib/admin/db";
import { findUserByUsernameOrEmail, getAdminSession, requireAdminRole, requireAdminSession } from "@/lib/admin/auth";
import { hashPassword, verifyPassword } from "@/lib/admin/password";
import { clearSessionCookie, setSessionCookie } from "@/lib/admin/session";
import { isAdminRole, isOperationsRole, loginHome, panelHome, saleDetailPath } from "@/lib/admin/types";
import { getReports, writeAudit } from "@/lib/admin/queries";

export type ActionState = { error?: string; ok?: boolean };

function str(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function num(formData: FormData, key: string) {
  const raw = str(formData, key);
  if (raw === "") return NaN;
  return Number(raw);
}

export async function loginAdmin(_prev: ActionState | null, formData: FormData): Promise<ActionState> {
  const identifier = str(formData, "username");
  const password = String(formData.get("password") ?? "");
  if (!identifier || !password) return { error: "Username and password are required." };

  const user = findUserByUsernameOrEmail(identifier);
  if (!user || !verifyPassword(password, user.password)) {
    return { error: "Invalid username or password." };
  }
  if (!user.is_active) return { error: "This account is inactive." };
  if (!isOperationsRole(user.role)) {
    return { error: "This account cannot access the pharmacy operations panel." };
  }

  await setSessionCookie(user.id);
  writeAudit({
    userId: user.id,
    action: "LOGIN",
    tableName: "USERS",
    recordId: user.id,
    description: `${user.username} signed in to the ${isAdminRole(user.role) ? "admin" : "staff"} panel.`,
  });
  redirect(panelHome(user.role));
}

export async function logoutAdmin() {
  const session = await getAdminSession();
  const nextLogin = session ? loginHome(session.role) : "/staff/login";
  if (session) {
    writeAudit({
      userId: session.id,
      action: "LOGOUT",
      tableName: "USERS",
      recordId: session.id,
      description: `${session.username} signed out of the pharmacy panel.`,
    });
  }
  await clearSessionCookie();
  redirect(nextLogin);
}

export async function createUser(_prev: ActionState | null, formData: FormData): Promise<ActionState> {
  const session = await requireAdminRole();
  const username = str(formData, "username").toLowerCase();
  const fullName = str(formData, "full_name");
  const role = str(formData, "role").toLowerCase() || "staff";
  const email = str(formData, "email").toLowerCase();
  const phone = str(formData, "phone");
  const password = String(formData.get("password") ?? "");

  if (!username) return { error: "Username is required." };
  if (!/^[a-z0-9._-]{3,40}$/.test(username)) {
    return { error: "Username must be 3–40 characters (letters, numbers, dots, underscores, or hyphens)." };
  }
  if (!fullName) return { error: "Full name is required." };
  if (!["admin", "staff", "pharmacist"].includes(role)) {
    return { error: "Role must be admin, pharmacist, or staff." };
  }
  if (email && !email.includes("@")) return { error: "Enter a valid email address." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const db = getDb();
  const exists = db
    .prepare("SELECT id FROM USERS WHERE lower(username) = ? OR (email IS NOT NULL AND lower(email) = ?)")
    .get(username, email || "__none__") as { id: number } | undefined;
  if (exists) return { error: "Username or email is already in use." };

  const now = nowIso();
  const result = db
    .prepare(
      `INSERT INTO USERS (username, password, full_name, role, email, phone, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`,
    )
    .run(username, hashPassword(password), fullName, role, email || null, phone || null, now, now);

  writeAudit({
    userId: session.id,
    action: "CREATE",
    tableName: "USERS",
    recordId: Number(result.lastInsertRowid),
    description: `Created user ${username} with role ${role}.`,
  });
  revalidatePath("/admin/users");
  redirect(`/admin/users/${Number(result.lastInsertRowid)}`);
}

export async function updateUser(_prev: ActionState | null, formData: FormData): Promise<ActionState> {
  const session = await requireAdminRole();
  const id = num(formData, "id");
  const fullName = str(formData, "full_name");
  const role = str(formData, "role").toLowerCase();
  const email = str(formData, "email").toLowerCase();
  const phone = str(formData, "phone");
  const username = str(formData, "username").toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!Number.isInteger(id)) return { error: "Invalid user." };
  if (!username) return { error: "Username is required." };
  if (!fullName) return { error: "Full name is required." };
  if (!["admin", "staff", "pharmacist"].includes(role)) {
    return { error: "Role must be admin, pharmacist, or staff." };
  }
  if (email && !email.includes("@")) return { error: "Enter a valid email address." };
  if (password && password.length < 8) return { error: "New password must be at least 8 characters." };

  const db = getDb();
  const current = db.prepare("SELECT * FROM USERS WHERE id = ?").get(id) as
    | { id: number; role: string; username: string }
    | undefined;
  if (!current) return { error: "User not found." };

  if (current.role === "admin" && role !== "admin") {
    const admins = (
      db.prepare("SELECT COUNT(*) AS c FROM USERS WHERE lower(role) = 'admin' AND is_active = 1").get() as {
        c: number;
      }
    ).c;
    if (admins <= 1) return { error: "Cannot remove the last active administrator." };
  }

  const clash = db
    .prepare(
      "SELECT id FROM USERS WHERE id != ? AND (lower(username) = ? OR (email IS NOT NULL AND lower(email) = ?))",
    )
    .get(id, username, email || "__none__") as { id: number } | undefined;
  if (clash) return { error: "Username or email is already in use." };

  const now = nowIso();
  if (password) {
    db.prepare(
      `UPDATE USERS SET username = ?, full_name = ?, role = ?, email = ?, phone = ?, password = ?, updated_at = ?
       WHERE id = ?`,
    ).run(username, fullName, role, email || null, phone || null, hashPassword(password), now, id);
  } else {
    db.prepare(
      `UPDATE USERS SET username = ?, full_name = ?, role = ?, email = ?, phone = ?, updated_at = ?
       WHERE id = ?`,
    ).run(username, fullName, role, email || null, phone || null, now, id);
  }

  writeAudit({
    userId: session.id,
    action: "UPDATE",
    tableName: "USERS",
    recordId: id,
    description: `Updated user ${username}${password ? " (password rotated)" : ""}.`,
  });
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${id}`);
  redirect(`/admin/users/${id}`);
}

export async function setUserActive(formData: FormData) {
  const session = await requireAdminRole();
  const id = num(formData, "id");
  const next = str(formData, "is_active") === "1" ? 1 : 0;
  if (!Number.isInteger(id)) return;
  if (id === session.id && next === 0) {
    redirect("/admin/users?error=self");
  }
  const db = getDb();
  const user = db.prepare("SELECT * FROM USERS WHERE id = ?").get(id) as
    | { role: string; username: string }
    | undefined;
  if (!user) return;
  if (user.role === "admin" && next === 0) {
    const admins = (
      db.prepare("SELECT COUNT(*) AS c FROM USERS WHERE lower(role) = 'admin' AND is_active = 1").get() as {
        c: number;
      }
    ).c;
    if (admins <= 1) redirect("/admin/users?error=lastadmin");
  }
  db.prepare("UPDATE USERS SET is_active = ?, updated_at = ? WHERE id = ?").run(next, nowIso(), id);
  writeAudit({
    userId: session.id,
    action: next ? "ACTIVATE" : "DEACTIVATE",
    tableName: "USERS",
    recordId: id,
    description: `${next ? "Activated" : "Deactivated"} user ${user.username}.`,
  });
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${id}`);
}

export async function createProduct(_prev: ActionState | null, formData: FormData): Promise<ActionState> {
  const session = await requireAdminRole();
  const productName = str(formData, "product_name");
  const genericName = str(formData, "generic_name");
  const category = str(formData, "category");
  const unitPrice = num(formData, "unit_price");
  const barcode = str(formData, "barcode");
  const description = str(formData, "description");

  if (!productName) return { error: "Product name is required." };
  if (!Number.isFinite(unitPrice) || unitPrice < 0) return { error: "Enter a valid unit price." };

  const db = getDb();
  if (barcode) {
    const exists = db.prepare("SELECT product_id FROM PRODUCTS WHERE barcode = ?").get(barcode) as
      | { product_id: number }
      | undefined;
    if (exists) return { error: "Barcode is already assigned to another product." };
  }

  const now = nowIso();
  const result = db
    .prepare(
      `INSERT INTO PRODUCTS (product_name, generic_name, category, unit_price, stock_quantity, barcode, description, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, 0, ?, ?, 1, ?, ?)`,
    )
    .run(productName, genericName || null, category || null, unitPrice, barcode || null, description || null, now, now);

  writeAudit({
    userId: session.id,
    action: "CREATE",
    tableName: "PRODUCTS",
    recordId: Number(result.lastInsertRowid),
    description: `Created product ${productName}. Stock starts at 0 until a batch is received.`,
  });
  revalidatePath("/admin/products");
  redirect(`/admin/products/${Number(result.lastInsertRowid)}`);
}

export async function updateProduct(_prev: ActionState | null, formData: FormData): Promise<ActionState> {
  const session = await requireAdminRole();
  const id = num(formData, "product_id");
  const productName = str(formData, "product_name");
  const genericName = str(formData, "generic_name");
  const category = str(formData, "category");
  const unitPrice = num(formData, "unit_price");
  const barcode = str(formData, "barcode");
  const description = str(formData, "description");

  if (!Number.isInteger(id)) return { error: "Invalid product." };
  if (!productName) return { error: "Product name is required." };
  if (!Number.isFinite(unitPrice) || unitPrice < 0) return { error: "Enter a valid unit price." };

  const db = getDb();
  if (barcode) {
    const exists = db
      .prepare("SELECT product_id FROM PRODUCTS WHERE barcode = ? AND product_id != ?")
      .get(barcode, id) as { product_id: number } | undefined;
    if (exists) return { error: "Barcode is already assigned to another product." };
  }

  db.prepare(
    `UPDATE PRODUCTS
     SET product_name = ?, generic_name = ?, category = ?, unit_price = ?, barcode = ?, description = ?, updated_at = ?
     WHERE product_id = ?`,
  ).run(productName, genericName || null, category || null, unitPrice, barcode || null, description || null, nowIso(), id);

  writeAudit({
    userId: session.id,
    action: "UPDATE",
    tableName: "PRODUCTS",
    recordId: id,
    description: `Updated product ${productName}.`,
  });
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  redirect(`/admin/products/${id}`);
}

export async function setProductActive(formData: FormData) {
  const session = await requireAdminRole();
  const id = num(formData, "product_id");
  const next = str(formData, "is_active") === "1" ? 1 : 0;
  if (!Number.isInteger(id)) return;
  const db = getDb();
  const product = db.prepare("SELECT product_name FROM PRODUCTS WHERE product_id = ?").get(id) as
    | { product_name: string }
    | undefined;
  if (!product) return;
  db.prepare("UPDATE PRODUCTS SET is_active = ?, updated_at = ? WHERE product_id = ?").run(next, nowIso(), id);
  writeAudit({
    userId: session.id,
    action: next ? "ACTIVATE" : "DEACTIVATE",
    tableName: "PRODUCTS",
    recordId: id,
    description: `${next ? "Activated" : "Deactivated"} product ${product.product_name}.`,
  });
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
}

type SaleLine = { product_id: number; quantity: number };

export async function recordSale(_prev: ActionState | null, formData: FormData): Promise<ActionState> {
  const session = await requireAdminSession();
  const customerId = str(formData, "customer_id");
  const paymentMethod = str(formData, "payment_method") || "cash";
  const paymentStatus = str(formData, "payment_status") || "paid";
  const rawLines = str(formData, "lines");

  let lines: SaleLine[] = [];
  try {
    lines = JSON.parse(rawLines) as SaleLine[];
  } catch {
    return { error: "Invalid sale items." };
  }
  if (!Array.isArray(lines) || lines.length === 0) return { error: "Add at least one product." };

  const merged = new Map<number, number>();
  for (const line of lines) {
    const productId = Number(line.product_id);
    const quantity = Number(line.quantity);
    if (!Number.isInteger(productId) || productId <= 0) return { error: "Invalid product on a line item." };
    if (!Number.isInteger(quantity) || quantity <= 0) return { error: "Quantities must be positive whole numbers." };
    merged.set(productId, (merged.get(productId) ?? 0) + quantity);
  }

  const db = getDb();
  let saleId = 0;
  db.exec("BEGIN IMMEDIATE");
  try {
    const items: Array<{ product_id: number; quantity: number; unit_price: number; subtotal: number; name: string }> =
      [];
    for (const [productId, quantity] of merged.entries()) {
      const product = db
        .prepare("SELECT product_id, product_name, unit_price, stock_quantity, is_active FROM PRODUCTS WHERE product_id = ?")
        .get(productId) as
        | { product_id: number; product_name: string; unit_price: number; stock_quantity: number; is_active: number }
        | undefined;
      if (!product || !product.is_active) throw new Error(`Product ${productId} is not available.`);
      if (product.stock_quantity < quantity) {
        throw new Error(`Insufficient stock for ${product.product_name}. Available: ${product.stock_quantity}.`);
      }

      const batches = db
        .prepare(
          `SELECT inventory_id, stock_quantity, expiry_date, batch_number
           FROM INVENTORY
           WHERE product_id = ? AND stock_quantity > 0
             AND (expiry_date IS NULL OR date(expiry_date) >= date('now'))
           ORDER BY (expiry_date IS NULL), date(expiry_date) ASC, inventory_id ASC`,
        )
        .all(productId) as Array<{
        inventory_id: number;
        stock_quantity: number;
        expiry_date: string | null;
        batch_number: string | null;
      }>;

      let remaining = quantity;
      for (const batch of batches) {
        if (remaining <= 0) break;
        const take = Math.min(batch.stock_quantity, remaining);
        db.prepare("UPDATE INVENTORY SET stock_quantity = stock_quantity - ?, updated_at = ? WHERE inventory_id = ?").run(
          take,
          nowIso(),
          batch.inventory_id,
        );
        remaining -= take;
      }
      if (remaining > 0) {
        throw new Error(
          `Not enough unexpired stock for ${product.product_name}. Expired batches cannot be sold (FEFO).`,
        );
      }

      const unitPrice = Number(product.unit_price);
      items.push({
        product_id: productId,
        quantity,
        unit_price: unitPrice,
        subtotal: Number((unitPrice * quantity).toFixed(2)),
        name: product.product_name,
      });
      syncProductStock(db, productId);
    }

    const total = Number(items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2));
    const saleDate = nowIso();
    const prefix = `RCP-${saleDate.slice(0, 10).replace(/-/g, "")}`;
    const count = (
      db.prepare("SELECT COUNT(*) AS c FROM SALES WHERE receipt_no LIKE ?").get(`${prefix}%`) as { c: number }
    ).c;
    const receiptNo = `${prefix}-${String(count + 1).padStart(4, "0")}`;

    const sale = db
      .prepare(
        `INSERT INTO SALES (customer_id, user_id, sale_date, total_amount, payment_method, payment_status, receipt_no)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(customerId || null, session.id, saleDate, total, paymentMethod, paymentStatus, receiptNo);
    saleId = Number(sale.lastInsertRowid);

    const insertItem = db.prepare(
      `INSERT INTO SALE_ITEMS (sale_id, product_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)`,
    );
    for (const item of items) {
      insertItem.run(saleId, item.product_id, item.quantity, item.unit_price, item.subtotal);
    }

    writeAudit({
      userId: session.id,
      action: "CREATE",
      tableName: "SALES",
      recordId: saleId,
      description: `Recorded sale ${receiptNo} totaling ${total.toFixed(2)} (${items.length} item groups).`,
    });
    db.exec("COMMIT");
  } catch (error) {
    try {
      db.exec("ROLLBACK");
    } catch {
      /* no open transaction */
    }
    return { error: error instanceof Error ? error.message : "Could not record the sale." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/sales");
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  revalidatePath("/staff");
  revalidatePath("/staff/sales");
  revalidatePath("/staff/inventory");
  revalidatePath("/staff/products");
  redirect(saleDetailPath(session.role, saleId));
}

export async function receiveStock(_prev: ActionState | null, formData: FormData): Promise<ActionState> {
  const session = await requireAdminRole();
  const productId = num(formData, "product_id");
  const quantity = num(formData, "stock_quantity");
  const batchNumber = str(formData, "batch_number");
  const expiryDate = str(formData, "expiry_date");
  const reorderLevel = num(formData, "reorder_level");

  if (!Number.isInteger(productId)) return { error: "Select a product." };
  if (!Number.isInteger(quantity) || quantity <= 0) return { error: "Incoming quantity must be a positive whole number." };
  if (!batchNumber) return { error: "Batch number is required." };
  if (!Number.isInteger(reorderLevel) || reorderLevel < 0) return { error: "Reorder level must be 0 or greater." };

  const db = getDb();
  const product = db.prepare("SELECT product_name FROM PRODUCTS WHERE product_id = ?").get(productId) as
    | { product_name: string }
    | undefined;
  if (!product) return { error: "Product not found." };

  const clash = db
    .prepare("SELECT inventory_id FROM INVENTORY WHERE product_id = ? AND batch_number = ?")
    .get(productId, batchNumber) as { inventory_id: number } | undefined;
  if (clash) return { error: "That batch number already exists for this product." };

  db.exec("BEGIN IMMEDIATE");
  try {
    const result = db
      .prepare(
        `INSERT INTO INVENTORY (product_id, stock_quantity, expiry_date, batch_number, reorder_level, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(productId, quantity, expiryDate || null, batchNumber, reorderLevel, nowIso());
    syncProductStock(db, productId);
    writeAudit({
      userId: session.id,
      action: "RECEIVE",
      tableName: "INVENTORY",
      recordId: Number(result.lastInsertRowid),
      description: `Received ${quantity} units of ${product.product_name} in batch ${batchNumber}.`,
    });
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    return { error: error instanceof Error ? error.message : "Could not receive stock." };
  }

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  redirect("/admin/inventory");
}

export async function adjustStock(_prev: ActionState | null, formData: FormData): Promise<ActionState> {
  const session = await requireAdminRole();
  const inventoryId = num(formData, "inventory_id");
  const newQty = num(formData, "stock_quantity");
  const reason = str(formData, "reason");
  const reorderLevel = num(formData, "reorder_level");

  if (!Number.isInteger(inventoryId)) return { error: "Invalid batch." };
  if (!Number.isInteger(newQty) || newQty < 0) return { error: "Stock quantity must be a whole number of 0 or more." };
  if (reason.length < 4) return { error: "Provide a reason for this adjustment." };
  if (!Number.isInteger(reorderLevel) || reorderLevel < 0) return { error: "Reorder level must be 0 or greater." };

  const db = getDb();
  const batch = db
    .prepare(
      `SELECT i.*, p.product_name FROM INVENTORY i JOIN PRODUCTS p ON p.product_id = i.product_id WHERE i.inventory_id = ?`,
    )
    .get(inventoryId) as
    | { inventory_id: number; product_id: number; stock_quantity: number; product_name: string; batch_number: string }
    | undefined;
  if (!batch) return { error: "Batch not found." };
  if (batch.stock_quantity === newQty) return { error: "New quantity is the same as the current quantity." };

  db.exec("BEGIN IMMEDIATE");
  try {
    db.prepare(
      "UPDATE INVENTORY SET stock_quantity = ?, reorder_level = ?, updated_at = ? WHERE inventory_id = ?",
    ).run(newQty, reorderLevel, nowIso(), inventoryId);
    syncProductStock(db, batch.product_id);
    writeAudit({
      userId: session.id,
      action: "ADJUST",
      tableName: "INVENTORY",
      recordId: inventoryId,
      description: `Adjusted batch ${batch.batch_number} of ${batch.product_name} from ${batch.stock_quantity} to ${newQty}. Reason: ${reason}`,
    });
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    return { error: error instanceof Error ? error.message : "Could not adjust stock." };
  }

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  redirect("/admin/inventory");
}

export async function exportReportCsv(kind: string, from: string, to: string) {
  await requireAdminSession();
  const report = getReports({ from, to });
  const lines: string[] = [];
  const cell = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;

  if (kind === "sales") {
    lines.push(["Staff", "Transactions", "Total"].map(cell).join(","));
    for (const row of report.byStaff) lines.push([row.full_name, row.count, row.total].map(cell).join(","));
  } else if (kind === "products") {
    lines.push(["Product", "Quantity sold", "Sales total"].map(cell).join(","));
    for (const row of report.bestSellers) lines.push([row.product_name, row.qty, row.total].map(cell).join(","));
  } else if (kind === "stock") {
    lines.push(["Product", "Category", "Stock", "Unit price", "Active"].map(cell).join(","));
    for (const row of report.stockLevels) {
      lines.push([row.product_name, row.category, row.stock_quantity, row.unit_price, row.is_active].map(cell).join(","));
    }
  } else if (kind === "expiry") {
    lines.push(["Product", "Batch", "Quantity", "Expiry"].map(cell).join(","));
    for (const row of report.expiry) {
      lines.push([row.product_name, row.batch_number, row.stock_quantity, row.expiry_date].map(cell).join(","));
    }
  } else {
    lines.push(["Status", "Count", "Total"].map(cell).join(","));
    for (const row of report.byStatus) lines.push([row.payment_status, row.count, row.total].map(cell).join(","));
  }

  return lines.join("\n");
}
