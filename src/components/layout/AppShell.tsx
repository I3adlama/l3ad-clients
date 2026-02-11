export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="halftone-bg">
      <div className="relative min-h-screen" style={{ zIndex: 10 }}>
        {children}
      </div>
    </div>
  );
}
