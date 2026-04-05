interface Props {
  candidate: any;
}

export default function HarakaCandidateCard({ candidate }: Props) {
  return (
    <div className="bg-[var(--sidebar-bg)] p-6 rounded-2xl border border-[var(--border-color)] space-y-3">
      <h3 className="text-lg font-black">{candidate.name}</h3>
      <p className="text-sm text-emerald-500 font-bold">
        AI Match Score: {candidate.score}%
      </p>
    </div>
  );
}