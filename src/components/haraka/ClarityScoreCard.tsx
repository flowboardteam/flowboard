interface Props {
  score: number;
}

export default function ClarityScoreCard({ score }: Props) {
  return (
    <div className="bg-[var(--bg-main)] p-4 rounded-xl border border-[var(--border-color)]">
      <p className="text-sm font-bold">Role Clarity Score</p>
      <h3 className="text-3xl font-black text-emerald-500">{score}/100</h3>
    </div>
  );
}