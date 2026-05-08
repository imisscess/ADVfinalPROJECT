import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 md:px-6 md:py-10">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        
        <section className="rounded-3xl border border-border bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Contact
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Get help with prescriptions, medication safety, and orders.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-slate-800 sm:col-span-2">
              Message
              <textarea
                placeholder="How can we help?"
                className="min-h-28 rounded-2xl border border-border bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-brand/40 focus:shadow-[0_0_0_4px_rgba(109,40,217,0.10)]"
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-800">
              Email
              <input
                type="email"
                placeholder="you@example.com"
                className="h-11 rounded-2xl border border-border bg-white px-4 text-sm text-slate-900 shadow-sm outline-none focus:border-brand/40 focus:shadow-[0_0_0_4px_rgba(109,40,217,0.10)]"
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-800">
              Order ID (optional)
              <input
                placeholder="PL-12345"
                className="h-11 rounded-2xl border border-border bg-white px-4 text-sm text-slate-900 shadow-sm outline-none focus:border-brand/40 focus:shadow-[0_0_0_4px_rgba(109,40,217,0.10)]"
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/products"
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-brand px-5 text-sm font-semibold text-white shadow-sm hover:bg-[#5b21b6]"
            >
              Browse products
            </Link>

            <Link
              href="/prescription"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-border bg-white px-5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
            >
              Prescription help
            </Link>
          </div>
        </section>

        <aside className="rounded-3xl border border-border bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
          <div className="text-sm font-semibold text-slate-900">Support</div>

          <div className="mt-3 space-y-2 text-sm text-slate-700">

            {/* ✅ UPDATED CHAT LINK */}
            <Link
              href="https://www.facebook.com/profile.php?id=100068925832637"
              target="_blank"
              className="flex items-center justify-between hover:opacity-80"
            >
              <span>Chat</span>
              <span className="font-semibold text-brand">Available</span>
            </Link>

            <div className="flex items-center justify-between">
              <span>Hotline</span>
              <span className="font-semibold">---------------</span>
            </div>

            <div className="flex items-center justify-between">
              <span>Email</span>
              <span className="font-semibold">301eastdrugstore@gmail.com</span>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-border bg-surface p-4 text-xs leading-6 text-slate-600">
            For real medical emergencies, contact local emergency services.
          </div>
        </aside>

      </div>
    </main>
  );
}