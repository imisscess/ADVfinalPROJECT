import Image from "next/image";
import Link from "next/link";

export default function CategoryCard({ category }) {
  const imageSrc =
    typeof category?.image === "string" && category.image.trim()
      ? category.image
      : "/images/categories/wellness.svg";

  return (
    <Link
      href={`/category/${category.slug}`}
      className="group rounded-3xl border border-border bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(15,23,42,0.10)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-surface">
        <Image src={imageSrc} alt={category.name} fill sizes="300px" className="object-cover" />
      </div>
      <div className="mt-3 text-base font-semibold text-slate-900 group-hover:text-brand">{category.name}</div>
      <div className="mt-1 text-sm text-slate-600">{category.description}</div>
    </Link>
  );
}

