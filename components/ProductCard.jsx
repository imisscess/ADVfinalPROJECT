import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "../app/products/components/AddToCartButton";

export default function ProductCard({ product }) {
  const imageSrc =
    typeof product?.imageSrc === "string" && product.imageSrc.trim()
      ? product.imageSrc
      : typeof product?.image === "string" && product.image.trim()
        ? product.image
        : "/images/products/products.svg";

  return (
    <div className="rounded-3xl border border-border bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-surface">
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            sizes="(max-width:1024px) 100vw, 420px"
            className="object-cover"
          />
        </div>
        <div className="mt-4 text-sm font-semibold text-slate-900">{product.name}</div>
        <div className="mt-1 text-sm text-slate-600">{product.description}</div>
      </Link>
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="text-base font-semibold text-slate-900">₱{product.price.toFixed(0)}</div>
        <AddToCartButton product={product} />
      </div>
    </div>
  );
}

