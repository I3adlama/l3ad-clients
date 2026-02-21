export default function SectionDivider() {
  return (
    <div
      className="h-px my-10"
      style={{
        width: "100vw",
        marginLeft: "calc(-50vw + 50%)",
        background:
          "linear-gradient(90deg, transparent 0%, var(--accent) 30%, var(--accent) 70%, transparent 100%)",
      }}
    />
  );
}
