import type { ProposalData } from "@/lib/types";

export default function PainPointsSlide({ data }: { data: ProposalData }) {
  return (
    <div className="proposal-slide">
      <h2 className="slide-heading">
        {data.title.client_name === "A Taste of Pearl"
          ? "KAL, HERE'S WHAT'S HOLDING YOU BACK"
          : "HERE'S WHAT'S HOLDING YOU BACK"}
      </h2>
      <p className="slide-subheading">
        Your food has 5-star reviews everywhere. But the digital side is leaving money on the table.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-4xl">
        {data.pain_points.map((pain, i) => (
          <div key={i} className="pain-card">
            <div className="flex items-center gap-2 mb-1">
              <i className={`${pain.icon} text-[#ef4444] text-sm`} />
              <span className="pain-card__title">{pain.title}</span>
            </div>
            <p className="pain-card__desc">{pain.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
