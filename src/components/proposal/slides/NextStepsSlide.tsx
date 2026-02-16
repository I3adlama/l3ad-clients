import type { ProposalData } from "@/lib/types";
import Image from "next/image";

export default function NextStepsSlide({ data }: { data: ProposalData }) {
  return (
    <section className="proposal-section text-center">
      {/* Logo at top */}
      <div className="scroll-fade-up flex justify-center mb-10">
        <Image
          src="/logo-large.png"
          alt="L3ad Solutions"
          width={280}
          height={64}
          priority
        />
      </div>

      <h1 className="scroll-fade-up delay-1 section-heading">
        READY? HERE&apos;S WHAT HAPPENS NEXT
      </h1>

      <div className="max-w-2xl mx-auto mt-8 text-left">
        {data.next_steps.steps.map((step, i) => (
          <div key={step.number} className={`scroll-fade-up delay-${Math.min(i + 2, 5)} next-step`}>
            <div className="next-step__circle">{step.number}</div>
            <div>
              <div className="next-step__title">{step.title}</div>
              <div className="next-step__desc">{step.description}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
