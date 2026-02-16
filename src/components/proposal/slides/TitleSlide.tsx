import type { ProposalData } from "@/lib/types";
import Image from "next/image";

export default function TitleSlide({ data }: { data: ProposalData }) {
  return (
    <div className="proposal-slide flex flex-col items-start justify-center">
      {/* Top teal accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--accent)]" />

      <Image
        src="/logo-header.png"
        alt="L3ad Solutions"
        width={220}
        height={50}
        className="mb-8"
        priority
      />

      <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-white mb-2 leading-tight">
        DIGITAL GROWTH
        <br />
        PROPOSAL
      </h1>

      {/* Teal divider */}
      <div className="w-32 h-1 bg-[var(--accent)] my-4" />

      <p className="font-display text-xl sm:text-2xl text-[var(--accent)] italic">
        {data.title.client_name}
      </p>

      <p className="text-[var(--text-soft)] text-sm mt-6 tracking-wider">
        Prepared by L3ad Solutions LLC &middot; {data.title.date}
      </p>

      {/* Bottom teal accent bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--accent)]" />
    </div>
  );
}
