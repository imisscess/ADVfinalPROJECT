"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "../lib/products";
import { getProductById } from "../lib/products";

export type CartLine = { productId: string; quantity: number };

type CartContextValue = {
  lines: CartLine[];
  add: (product: Product, qty?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "pharmalink_cart_v1";

function safeParseLines(raw: string | null): CartLine[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((x) => {
        const obj = x as { productId?: unknown; quantity?: unknown };
        if (typeof obj.productId !== "string") return null;
        const q = typeof obj.quantity === "number" ? obj.quantity : 0;
        const quantity = Number.isFinite(q) ? Math.max(0, Math.floor(q)) : 0;
        if (quantity <= 0) return null;
        return { productId: obj.productId, quantity };
      })
      .filter(Boolean) as CartLine[];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => {
    if (typeof window === "undefined") return [];
    return safeParseLines(window.localStorage.getItem(STORAGE_KEY));
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines]);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((sum, l) => sum + l.quantity, 0);
    const subtotal = lines.reduce((sum, l) => {
      const p = getProductById(l.productId);
      return sum + (p ? p.price * l.quantity : 0);
    }, 0);

    return {
      lines,
      add: (product, qty = 1) => {
        const addQty = Math.max(1, Math.floor(qty));
        setLines((prev) => {
          const idx = prev.findIndex((l) => l.productId === product.id);
          if (idx === -1) return [...prev, { productId: product.id, quantity: addQty }];
          const next = [...prev];
          next[idx] = { ...next[idx], quantity: next[idx].quantity + addQty };
          return next;
        });
      },
      remove: (productId) => {
        setLines((prev) => prev.filter((l) => l.productId !== productId));
      },
      setQty: (productId, qty) => {
        const q = Math.max(0, Math.floor(qty));
        setLines((prev) => {
          if (q === 0) return prev.filter((l) => l.productId !== productId);
          const idx = prev.findIndex((l) => l.productId === productId);
          if (idx === -1) return [...prev, { productId, quantity: q }];
          const next = [...prev];
          next[idx] = { ...next[idx], quantity: q };
          return next;
        });
      },
      clear: () => setLines([]),
      count,
      subtotal,
    };
  }, [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
