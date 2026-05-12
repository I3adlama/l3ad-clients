import type { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import Header from "@/components/layout/Header";
import ComicFooter from "@/components/layout/ComicFooter";
import ComicCard from "@/components/ui/ComicCard";
import VendorApplicationForm from "./VendorApplicationForm";

export const metadata: Metadata = {
  title: "Vendor Application - Legacies Memorial Day Bash | Titusville FL",
  description:
    "Apply for a vendor spot at Legacies 1st Annual Memorial Day Bash on Saturday, May 23, 2026 in Titusville, FL. $50 per spot, first come first served.",
  robots: { index: false, follow: false },
};

export default function MemorialDayBashVendorApplicationPage() {
  return (
    <AppShell>
      <Header />
      <div className="min-h-screen overflow-x-hidden">
        <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
          <ComicCard variant="dark">
            <div className="p-5 sm:p-7">
              <h1 className="font-display text-2xl sm:text-3xl leading-tight">
                Legacies 1st Annual Memorial Day Bash
              </h1>
              <p className="font-display text-xl sm:text-2xl text-accent mt-1">
                Vendor Application
              </p>

              <div className="mt-5 space-y-1 text-sm sm:text-base">
                <p>
                  <span className="font-ui uppercase tracking-wider text-[var(--text-soft)] text-xs">
                    When
                  </span>{" "}
                  <span className="ml-1">Saturday, May 23, 2026</span>
                </p>
                <p>
                  <span className="font-ui uppercase tracking-wider text-[var(--text-soft)] text-xs">
                    Where
                  </span>{" "}
                  <span className="ml-1">Legacies NY Deli — Titusville, FL</span>
                </p>
              </div>

              <p className="mt-5 text-[var(--text-muted)]">
                22+ vendor spots available at $50 per spot. First come, first
                served — only paid spots are locked in.
              </p>

              <div className="mt-5">
                <p className="font-ui uppercase tracking-wider text-[var(--text-soft)] text-xs mb-2">
                  What brings the crowd
                </p>
                <ul className="space-y-1.5 text-[var(--text-muted)] text-sm sm:text-base">
                  <li className="flex gap-2">
                    <span className="text-accent">›</span>
                    <span>All-day trophy car show</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent">›</span>
                    <span>Beer tent, 5–9pm</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent">›</span>
                    <span>Live music</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent">›</span>
                    <span>Family activities</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent">›</span>
                    <span>9:15pm fireworks finale</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-5 border-t border-[var(--border)] text-sm text-[var(--text-muted)]">
                <p>
                  Applications are reviewed within 24 hours. On approval we send
                  payment details — $50 due via Zelle or CashApp to confirm your
                  spot.
                </p>
              </div>
            </div>
          </ComicCard>

          <div className="mt-6">
            <ComicCard variant="dark">
              <div className="p-5 sm:p-7">
                <VendorApplicationForm />
              </div>
            </ComicCard>
          </div>

          <p className="text-center text-[var(--text-soft)] text-xs mt-6">
            Powered by{" "}
            <a
              href="https://l3adsolutions.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent-bright"
            >
              L3ad Solutions
            </a>
          </p>
        </div>
      </div>
      <ComicFooter />
    </AppShell>
  );
}
