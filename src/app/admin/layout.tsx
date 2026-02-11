import Link from "next/link";
import Image from "next/image";
import AppShell from "@/components/layout/AppShell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      <header className="border-b border-[var(--border)] bg-noir-800/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/admin" className="no-underline">
            <Image
              src="/logo-header.png"
              alt="L3ad Solutions"
              width={140}
              height={32}
              priority
            />
          </Link>
          <span className="font-ui text-xs tracking-widest text-[var(--text-soft)] uppercase">
            Client Intake
          </span>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </AppShell>
  );
}
