"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const slides = [
  "/images/hero/0.png",
  "/images/hero/2.png",
  "/images/hero/3.png",
];

export default function HeroCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border bg-white shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
      <div className="relative h-[420px] w-full sm:h-[460px]">
        {slides.map((src, idx) => (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-700 ${idx === active ? "opacity-100" : "opacity-0"}`}
          >
            <Image
              src={src}
              alt={`Hero slide ${idx + 1}`}
              fill
              sizes="(max-width:768px) 100vw, 780px"
              className="object-cover"
              priority={idx === 0}
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/20" />
        <div className="absolute left-6 top-1/2 max-w-lg -translate-y-1/2 sm:left-10">
          <h1 className="mt-60 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Your Health, Our Priority
          </h1>
          <p className="mt-3 text-base text-slate-600 sm:text-lg">
            Fast and reliable pharmacy service for prescriptions, <br></br>
            OTC, and Wellness essentials.
          </p>
        </div>
      </div>
    </section>
  );
}

