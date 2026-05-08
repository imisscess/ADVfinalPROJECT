import Link from "next/link";
import HeroCarousel from "../components/HeroCarousel";
import ProductCard from "../components/ProductCard";
import CategoryCard from "../components/CategoryCard";
import { categories } from "../data/categories";
import { products } from "./lib/products";
import { HomeSearchAndShortcuts } from "./home/HomeSearchAndShortcuts";

export default function Home() {
  return (
    <div className="min-h-full bg-surface">
      <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-10">
        <HeroCarousel />

        <HomeSearchAndShortcuts />

        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                Featured products
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Sample catalog with real cart functionality.
              </p>
            </div>
            <Link
              href="/products"
              className="rounded-2xl border border-border bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
            >
              View all
            </Link>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.slice(0, 6).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        <section id="categories" className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                Shop by category
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Everything you need—organized for fast, confident shopping.
              </p>
            </div>
            <Link href="/products" className="hidden rounded-2xl border border-border bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 sm:inline-flex">Browse all</Link>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <CategoryCard key={c.slug} category={c} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
