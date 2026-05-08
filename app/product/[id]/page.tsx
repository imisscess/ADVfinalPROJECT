import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "../../products/components/AddToCartButton";
import { getProductById } from "../../lib/products";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-6 md:px-6 md:py-10">
        <div className="rounded-3xl border border-border bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Product not found
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            This product doesn’t exist in the sample catalog.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/products"
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-brand px-5 text-sm font-semibold text-white shadow-sm hover:bg-[#5b21b6]"
            >
              Back to products
            </Link>
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-border bg-white px-5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
            >
              Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-10">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
          <div className="relative aspect-[16/11] overflow-hidden rounded-2xl bg-surface">
            <Image
              src={product.imageSrc}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 720px"
              className="object-cover"
            />
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
          <div className="inline-flex rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-slate-800">
            {product.category}
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
            {product.name}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {product.description} This is demo content for a connected, no-404 pharmacy
            storefront.
          </p>

          <div className="mt-5 flex items-center justify-between gap-4">
            <div className="text-2xl font-semibold text-slate-900">
              ₱{product.price.toFixed(0)}
            </div>
            <AddToCartButton product={product} className="h-11 px-6" />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/cart"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-border bg-white px-5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
            >
              View cart
            </Link>
            <Link
              href="/products"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-border bg-white px-5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
            >
              Back to products
            </Link>
          </div>

          <div className="mt-6 rounded-2xl border border-border bg-surface p-4 text-xs leading-6 text-slate-600">
            <span className="font-semibold text-slate-800">Note:</span> Always
            consult a licensed professional for medication advice.
          </div>
        </div>
      </div>
    </main>
  );
}

