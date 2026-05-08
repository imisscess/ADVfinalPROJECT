import { products as rawProducts } from "../../data/products";

export type Product = {
  id: string;
  name: string;
  price: number;
  imageSrc: string;
  category:
    | "Prescription"
    | "OTC"
    | "Wellness"
    | "First Aid"
    | "Baby Care"
    | "Personal Care";
  description: string;
};

export const products: Product[] = (rawProducts as Array<{
  id: string;
  name: string;
  price: number;
  image: string;
  category: Product["category"];
  description: string;
}>).map((p) => ({
  id: p.id,
  name: p.name,
  price: p.price,
  imageSrc: p.image,
  category: p.category,
  description: p.description,
}));

export function getProductById(id: string) {
  return products.find((p) => p.id === id) ?? null;
}

