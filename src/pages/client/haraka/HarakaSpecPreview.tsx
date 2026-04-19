import ClarityScoreCard from "../../../components/haraka/ClarityScoreCard";
import { clarityScore } from "../../../lib/haraka/clarityScore";

interface Props {
  spec: any;
  onSearchResults: (results: any[]) => void;
}

export default function HarakaSpecPreview({ spec, onSearchResults }: Props) {

  const score = clarityScore(spec);

  const handleSearch = () => {
    // TEMP fake results
    onSearchResults([
      { id: 1, name: "Jane Doe", score: 92 },
      { id: 2, name: "Michael Smith", score: 87 },
    ]);
  };

  return (
    <div className="space-y-6 bg-[var(--sidebar-bg)] p-6 rounded-2xl border border-[var(--border-color)]">

      <h2 className="text-xl font-black">Structured Hiring Spec</h2>

      <div className="text-sm space-y-2">
        <p><strong>Role:</strong> {spec.role_title}</p>
        <p><strong>Seniority:</strong> {spec.seniority}</p>
        <p><strong>Must-Haves:</strong> {spec.must_have_skills.join(", ")}</p>
      </div>

      <ClarityScoreCard score={score} />

      <button
        onClick={handleSearch}
        className="bg-emerald-500 px-6 py-3 rounded-xl font-bold text-white shadow-lg shadow-emerald-500/20"
      >
        Search Global Talent
      </button>
    </div>
  );
}