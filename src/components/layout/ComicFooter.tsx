export default function ComicFooter() {
  return (
    <footer className="w-full border-t-2 border-white/10 mt-12">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="text-xl font-black uppercase text-white tracking-tight">
              L3ad <span className="text-[#00f0d0]">Solutions</span>
            </div>
            <p className="mt-2 text-sm text-white/50">
              SEO, Web Design &amp; Marketing for local businesses.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-black uppercase text-white tracking-wider mb-3">
              Services
            </h3>
            <nav className="space-y-1.5 text-sm text-white/50">
              <p>Web Design</p>
              <p>Local SEO</p>
              <p>Digital Marketing</p>
              <p>AI Automation</p>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-black uppercase text-white tracking-wider mb-3">
              Get in Touch
            </h3>
            <nav className="space-y-1.5 text-sm">
              <a
                href="https://l3adsolutions.com/contact"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-[#00f0d0] hover:text-white transition"
              >
                Contact Us
              </a>
              <a
                href="https://l3adsolutions.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-white/50 hover:text-[#00f0d0] transition"
              >
                l3adsolutions.com
              </a>
            </nav>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} L3ad Solutions. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
