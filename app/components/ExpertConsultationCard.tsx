import Image from "next/image";
import Link from "next/link";

export function ExpertConsultationCard() {
  return (
    <aside className="rounded-3xl border border-border bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-slate-900">
            Expert Consultation
          </div>
          <div className="mt-1 text-sm leading-6 text-slate-600">
            Chat with a licensed pharmacist for safe, confident care.
          </div>
        </div>
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-brand-soft">
          <Image
            src="/hero/doctor.svg"
            alt="Pharmacist avatar"
            fill
            sizes="56px"
            className="object-cover"
          />
        </div>
      </div>

      <ul className="mt-4 space-y-2 text-sm text-slate-700">
        <li className="flex gap-2">
          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-brand" />
          Medication reviews
        </li>
        <li className="flex gap-2">
          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-brand" />
          Prescription help
        </li>
        <li className="flex gap-2">
          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-brand" />
          Health consultations
        </li>
      </ul>

      <Link
        href="/contact"
        className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-brand to-brand-2 px-5 text-sm font-semibold text-white shadow-sm hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-[rgba(37,99,235,0.20)]"
      >
        Talk to a Pharmacist
      </Link>
    </aside>
  );
}

