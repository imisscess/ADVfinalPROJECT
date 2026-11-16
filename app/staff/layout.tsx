export const runtime = "nodejs";

export default function StaffRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-full flex-1 flex-col bg-surface">{children}</div>;
}
