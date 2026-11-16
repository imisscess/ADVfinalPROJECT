import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./cart/CartProvider";
import { AuthProvider } from "./auth/AuthProvider";
import { SearchProvider } from "./search/SearchProvider";
import { SiteChrome } from "./components/SiteChrome";
import { FirebaseClient } from "./components/FirebaseClient";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "301 EAST Drugstore",
  description:
    "A modern, trusted online pharmacy for prescriptions, OTC medications, and wellness essentials.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-surface text-slate-900">
        <FirebaseClient />
        <AuthProvider>
          <SearchProvider>
            <CartProvider>
              <SiteChrome>{children}</SiteChrome>
            </CartProvider>
          </SearchProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
