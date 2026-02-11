export default function ThankYouPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md text-center">
        <div className="noir-panel p-8">
          <div className="w-16 h-16 bg-accent/10 border-2 border-accent rounded-full flex items-center justify-center mx-auto mb-6">
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

          <h1 className="font-display text-3xl mb-3">You&apos;re all set!</h1>

          <p className="text-[var(--text-muted)] mb-2">
            Thanks for taking the time to fill this out. This gives us everything
            we need to get started on your site.
          </p>

          <p className="text-[var(--text-soft)] text-sm">
            We&apos;ll be in touch soon.
          </p>
        </div>

        <p className="text-[var(--text-soft)] text-xs mt-6">
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
  );
}
