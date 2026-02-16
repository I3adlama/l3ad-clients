import type { ProposalData } from "@/lib/types";

export default function PainPointsSlide({ data }: { data: ProposalData }) {
  return (
    <section className="proposal-section">
      <h1 className="scroll-fade-up section-heading">
        {data.title.client_name === "A Taste of Pearl"
          ? "KAL, HERE'S WHAT'S HOLDING YOU BACK"
          : "HERE'S WHAT'S HOLDING YOU BACK"}
      </h1>
      <p className="scroll-fade-up delay-1 section-subheading">
        Your food has 5-star reviews everywhere. But the digital side is leaving money on the table.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data.pain_points.map((pain, i) => (
          <div key={i} className={`scroll-fade-up delay-${Math.min(i + 1, 5)} pain-card`}>
            <div className="flex items-center gap-2.5 mb-2">
              <i className={`${pain.icon} text-[#ef4444] text-base`} />
              <span className="pain-card__title">{pain.title}</span>
            </div>
            <p className="pain-card__desc">{pain.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
