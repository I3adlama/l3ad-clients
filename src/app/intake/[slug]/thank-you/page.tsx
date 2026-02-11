import AppShell from "@/components/layout/AppShell";
import Header from "@/components/layout/Header";
import ComicCard from "@/components/ui/ComicCard";
import ComicFooter from "@/components/layout/ComicFooter";

export default function ThankYouPage() {
  return (
    <AppShell>
      <Header />
      <div className="flex items-center justify-center p-4 min-h-[70vh]">
        <div className="max-w-md w-full">
          <ComicCard variant="burst" floating>
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-[#00f0d0]/10 border-2 border-[#00f0d0] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
                  <path
                    d="M2 11L10 19L26 3"
                    stroke="#00f0d0"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <h1 className="font-display text-3xl mb-3 text-black">You&apos;re all set!</h1>

              <p className="text-noir-500 mb-2">
                Thanks for taking the time to fill this out. This gives us everything
                we need to get started on your site.
              </p>

              <p className="text-noir-400 text-sm">
                We&apos;ll be in touch soon.
              </p>
            </div>
          </ComicCard>
        </div>
      </div>
      <ComicFooter />
    </AppShell>
  );
}
