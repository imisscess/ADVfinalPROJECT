"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type Slide = {
  title: string;
  subtitle: string;
  imageSrc: string;
  imageAlt: string;
};

const SLIDE_MS = 5000;

export function HeroCarousel() {
  const slides: Slide[] = useMemo(
    () => [
      {
        title: "Your Health, Our Priority",
        subtitle: "Fast delivery, verified medicines, and pharmacist support when you need it.",
        imageSrc: "/hero/medicines.svg",
        imageAlt: "Assorted medicines and pharmacy items",
      },
      {
        title: "Stocked, Trusted, Ready",
        subtitle: "Shop OTC essentials and daily wellness products with confidence.",
        imageSrc: "/hero/shelves.svg",
        imageAlt: "Pharmacy shelves with health products",
      },
      {
        title: "Guidance You Can Trust",
        subtitle: "Get help with prescriptions, refills, and safe medication use.",
        imageSrc: "/hero/consultation.svg",
        imageAlt: "Pharmacist consultation",
      },
      {
        title: "Wellness Made Simple",
        subtitle: "Vitamins, skincare, and personal care—curated for every routine.",
        imageSrc: "/hero/wellness.svg",
        imageAlt: "Wellness and health products",
      },
    ],
    [],
  );

  const [active, setActive] = useState(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (pausedRef.current) return;
      setActive((i) => (i + 1) % slides.length);
    }, SLIDE_MS);
    return () => window.clearInterval(id);
  }, [slides.length]);

  return (
    <section
      className="relative overflow-hidden rounded-3xl border border-border bg-white shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
      aria-label="Featured pharmacy highlights"
    >
      <div className="relative h-[420px] w-full sm:h-[460px]">
        {slides.map((s, idx) => (
          <div
            key={s.imageSrc}
            className={[
              "absolute inset-0 transition-opacity duration-700",
              idx === active ? "opacity-100" : "opacity-0",
            ].join(" ")}
            aria-hidden={idx !== active}
          >
            <Image
              src={s.imageSrc}
              alt={s.imageAlt}
              fill
              priority={idx === 0}
              sizes="(max-width: 768px) 100vw, 780px"
              className="object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/75 to-white/15" />
          </div>
        ))}

        <div className="absolute inset-0 flex items-center">
          <div className="w-full px-6 py-8 sm:px-10">
            <div className="max-w-lg">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700">
                <span className="h-2 w-2 rounded-full bg-brand" />
                Verified pharmacy partners
              </div>
              <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl">
                {slides[active]?.title}
              </h1>
              <p className="mt-3 text-base leading-7 text-slate-600 sm:text-lg">
                {slides[active]?.subtitle}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="#categories"
                  className="inline-flex h-11 items-center justify-center rounded-2xl bg-brand px-5 text-sm font-semibold text-white shadow-sm hover:bg-[#5b21b6] focus:outline-none focus:ring-4 focus:ring-[rgba(109,40,217,0.20)]"
                >
                  Shop Categories
                </Link>
                <Link
                  href="/prescription"
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-border bg-white px-5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                >
                  Upload Prescription
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap gap-2 text-xs text-slate-600">
                <span className="rounded-full bg-brand-soft px-3 py-1.5">
                  Same-day delivery (select areas)
                </span>
                <span className="rounded-full bg-brand-soft px-3 py-1.5">
                  Secure checkout
                </span>
                <span className="rounded-full bg-brand-soft px-3 py-1.5">
                  Licensed pharmacist support
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-5 left-6 flex items-center gap-2 sm:left-10">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              className={[
                "h-2.5 rounded-full transition-all",
                i === active ? "w-8 bg-brand" : "w-2.5 bg-slate-300 hover:bg-slate-400",
              ].join(" ")}
              onClick={() => setActive(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

