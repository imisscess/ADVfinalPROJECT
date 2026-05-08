export const categories = [
  {
    slug: "prescription",
    name: "Prescription",
    description: "Prescription medicines with pharmacist guidance.",
    image: "/images/categories/Prescription.png",
  },
  {
    slug: "otc",
    name: "OTC",
    description: "Over-the-counter essentials for everyday relief.",
    image: "/images/categories/OTC.png",
  },
  {
    slug: "wellness",
    name: "Wellness",
    description: "Vitamins, supplements, and immune support.",
    image: "/images/categories/Wellness.png",
  },
  {
    slug: "first-aid",
    name: "First Aid",
    description: "Bandages, antiseptics, and wound care must-haves.",
    image: "/images/categories/FirstAid.png",
  },
  {
    slug: "baby-care",
    name: "Baby Care",
    description: "Gentle baby hygiene and daily care essentials.",
    image: "/images/categories/BabyCare.png",
  },
  {
    slug: "personal-care",
    name: "Personal Care",
    description: "Skin, body, and hygiene products for daily use.",
    image: "/images/categories/Personal.png",
  },
];

export const categorySlugToName = Object.fromEntries(
  categories.map((c) => [c.slug, c.name]),
);
