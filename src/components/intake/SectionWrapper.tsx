interface SectionWrapperProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function SectionWrapper({
  title,
  subtitle,
  children,
}: SectionWrapperProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-display">{title}</h2>
        {subtitle && (
          <p className="text-[var(--text-soft)] mt-1">{subtitle}</p>
        )}
      </div>

      <div className="space-y-5">{children}</div>
    </div>
  );
}
