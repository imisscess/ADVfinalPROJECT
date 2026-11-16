"use client";

import { usePathname, useRouter } from "next/navigation";
import type { Product } from "../../lib/products";
import { useCart } from "../../cart/CartProvider";
import { useAuth } from "../../auth/AuthProvider";

export function AddToCartButton({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const { add } = useCart();
  const { user, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname() || "/products";

  return (
    <button
      type="button"
      onClick={() => {
        if (!ready) return;
        if (!user) {
          router.push(`/login?next=${encodeURIComponent(pathname)}`);
          return;
        }
        add(product, 1);
      }}
      className={
        className ??
        "inline-flex h-10 items-center justify-center rounded-2xl bg-brand px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#5b21b6] focus:outline-none focus:ring-4 focus:ring-[rgba(109,40,217,0.20)]"
      }
    >
      Add to cart
    </button>
  );
}
