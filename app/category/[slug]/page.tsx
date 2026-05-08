import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Product } from "../../lib/products";
import { ProductsClient } from "../../products/components/ProductsClient";
import { categories } from "../../../data/categories";

const slugToCategory: Record<string, Product["category"]> = Object.fromEntries(
  (categories as Array<{ slug: string; name: Product["category"] }>).map((c) => [
    c.slug,
    c.name,
  ]),
) as Record<string, Product["category"]>;

const subtitles: Partial<Record<Product["category"], string>> = {
  OTC: "Over-the-counter essentials for daily relief and care.",
  Wellness: "Vitamins, supplements, immune boosters, and herbal health picks.",
  Prescription: "Prescription medicines (mock catalog).",
  "First Aid": "Bandages, antiseptics, wound care, and ointments.",
  "Baby Care": "Gentle essentials for babies and toddlers.",
  "Personal Care": "Skin care, soaps, lotions, and hygiene products.",
};

function titleFromCategory(cat: Product["category"]) {
  return cat;
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = slugToCategory[slug];
  if (!category) notFound();

  return (
    <Suspense>
      <ProductsClient
        forcedCategory={category}
        title={titleFromCategory(category)}
        subtitle={subtitles[category] ?? "Browse products in this category."}
      />
    </Suspense>
  );
}

