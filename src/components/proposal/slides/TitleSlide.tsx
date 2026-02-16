import type { ProposalData } from "@/lib/types";
import Image from "next/image";

export default function TitleSlide({ data }: { data: ProposalData }) {
  return (
    <section className="min-h-screen flex flex-col items-start justify-center px-6 sm:px-10 lg:px-16 relative">
      {/* Top teal accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--accent)]" />

      <div className="scroll-fade-up">
        <Image
          src="/logo-header.png"
          alt="L3ad Solutions"
          width={240}
          height={55}
          className="mb-10"
          priority
        />
      </div>

      <h1 className="scroll-fade-up delay-1 font-display text-5xl sm:text-6xl md:text-7xl text-white mb-3 leading-tight">
        DIGITAL GROWTH
        <br />
        PROPOSAL
      </h1>

      <div className="scroll-fade-up delay-2 w-36 h-1 bg-[var(--accent)] my-5" />

      <p className="scroll-fade-up delay-3 font-display text-2xl sm:text-3xl text-[var(--accent)] italic">
        {data.title.client_name}
      </p>

      <p className="scroll-fade-up delay-4 font-body text-base text-[var(--text-soft)] mt-8 tracking-wider">
        Prepared by L3ad Solutions LLC &middot; {data.title.date}
      </p>

      {/* Bottom teal accent bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--accent)]" />
    </section>
  );
}
