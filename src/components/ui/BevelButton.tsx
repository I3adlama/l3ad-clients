"use client";

import Link from "next/link";

interface BevelButtonProps {
  href?: string;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  full?: boolean;
  className?: string;
  children: React.ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export default function BevelButton({
  href,
  variant = "primary",
  size = "md",
  full = false,
  className = "",
  children,
  type = "button",
  disabled = false,
  onClick,
}: BevelButtonProps) {
  const variantClass = variant === "secondary" ? "nav-btn--secondary" : "";
  const sizeClass = size !== "md" ? `nav-btn--${size}` : "";
  const fullClass = full ? "nav-btn--full" : "";

  const inner = (
    <span className={`nav-btn ${variantClass} ${sizeClass} ${fullClass}`.trim()}>
      <span className="nav-btn__outline">
        <span className="nav-btn__shadow">
          <span className="nav-btn__inside">{children}</span>
        </span>
      </span>
    </span>
  );

  if (href) {
    const isExternal = /^(https?:|tel:|mailto:)/.test(href);
    if (isExternal) {
      return (
        <a href={href} className={className} target="_blank" rel="noopener noreferrer">
          {inner}
        </a>
      );
    }
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`.trim()}
    >
      {inner}
    </button>
  );
}
