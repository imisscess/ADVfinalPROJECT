import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-border bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 text-sm text-slate-600 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} 301 EAST Drugstore</span>
          <div className="flex items-center gap-4">
            <Link href="/contact" className="hover:text-slate-900">Contact</Link>
            <Link href="/products" className="hover:text-slate-900">Products</Link>
            <Link href="/cart" className="hover:text-slate-900">Cart</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

