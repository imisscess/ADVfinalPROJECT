"use client";

import { usePathname } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideChrome = pathname.startsWith("/admin") || pathname.startsWith("/staff");

  return (
    <>
      {hideChrome ? null : <Navbar />}
      {children}
      {hideChrome ? null : <Footer />}
    </>
  );
}
