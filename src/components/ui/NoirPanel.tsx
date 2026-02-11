interface NoirPanelProps {
  children: React.ReactNode;
  accent?: boolean;
  className?: string;
}

export default function NoirPanel({
  children,
  accent = false,
  className = "",
}: NoirPanelProps) {
  return (
    <div
      className={`noir-panel ${accent ? "noir-panel--accent" : ""} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
