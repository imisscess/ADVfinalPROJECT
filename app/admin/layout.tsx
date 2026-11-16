export const runtime = "nodejs";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-full flex-1 flex-col bg-surface">{children}</div>;
}
