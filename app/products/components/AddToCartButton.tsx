"use client";

import type { Product } from "../../lib/products";
import { useCart } from "../../cart/CartProvider";

export function AddToCartButton({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const { add } = useCart();
  return (
    <button
      type="button"
      onClick={() => add(product, 1)}
      className={
        className ??
        "inline-flex h-10 items-center justify-center rounded-2xl bg-brand px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#5b21b6] focus:outline-none focus:ring-4 focus:ring-[rgba(109,40,217,0.20)]"
      }
    >
      Add to cart
    </button>
  );
}

