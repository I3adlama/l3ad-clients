import type { ProposalData } from "@/lib/types";
import Image from "next/image";

export default function NextStepsSlide({ data }: { data: ProposalData }) {
  return (
    <div className="proposal-slide">
      <h2 className="slide-heading">READY? HERE&apos;S WHAT HAPPENS NEXT</h2>

      <div className="max-w-3xl space-y-2">
        {data.next_steps.steps.map((step) => (
          <div key={step.number} className="next-step">
            <div className="next-step__circle">{step.number}</div>
            <div>
              <div className="next-step__title">{step.title}</div>
              <div className="next-step__desc">{step.description}</div>
            </div>
          </div>
        ))}
      </div>

      {/* L3ad logo */}
      <div className="flex justify-center mt-8">
        <Image
          src="/logo-header.png"
          alt="L3ad Solutions"
          width={120}
          height={28}
          className="opacity-60"
        />
      </div>
    </div>
  );
}
