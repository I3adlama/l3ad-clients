import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--border)] bg-noir-800">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/admin" className="font-display text-xl text-white no-underline">
            L3ad Solutions
          </Link>
          <span className="font-ui text-xs tracking-widest text-[var(--text-soft)] uppercase">
            Client Intake
          </span>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
