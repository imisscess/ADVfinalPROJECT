import { Suspense } from "react";
import { ProductsClient } from "./components/ProductsClient";

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsClient />
    </Suspense>
  );
}

