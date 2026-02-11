interface ComicCardProps {
  variant?: "default" | "burst" | "quiet" | "noir" | "minimal" | "prose";
  floating?: boolean;
  accent?: boolean;
  className?: string;
  children: React.ReactNode;
}

export default function ComicCard({
  variant = "default",
  floating = false,
  accent = false,
  className = "",
  children,
}: ComicCardProps) {
  const variantClass = variant !== "default" ? `comic-card--${variant}` : "";
  const floatingClass = floating ? "comic-card--floating" : "";
  const accentClass = accent ? "comic-card--accent" : "";

  return (
    <div
      className={`comic-card ${variantClass} ${floatingClass} ${accentClass} ${className}`.trim()}
    >
      {/* Corner brackets */}
      <span className="comic-card__corner comic-card__corner--tl" />
      <span className="comic-card__corner comic-card__corner--tr" />
      <span className="comic-card__corner comic-card__corner--bl" />
      <span className="comic-card__corner comic-card__corner--br" />

      {/* Content */}
      <div className="comic-card__content">{children}</div>
    </div>
  );
}
