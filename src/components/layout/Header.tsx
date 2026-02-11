import Image from "next/image";

export default function Header() {
  return (
    <header className="py-4 px-4">
      <div className="max-w-lg mx-auto flex items-center justify-center">
        <a
          href="https://l3adsolutions.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="/logo-header.png"
            alt="L3ad Solutions"
            width={180}
            height={40}
            priority
          />
        </a>
      </div>
    </header>
  );
}
