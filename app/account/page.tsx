import Link from "next/link";

export default function AccountPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 md:px-6 md:py-10">
      <div className="rounded-3xl border border-border bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Account
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          You’re logged in. Use the navbar to continue shopping.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/products"
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-brand px-5 text-sm font-semibold text-white shadow-sm hover:bg-[#5b21b6]"
          >
            Browse products
          </Link>
          <Link
            href="/cart"
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-border bg-white px-5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
          >
            View cart
          </Link>
        </div>
      </div>
    </main>
  );
}

