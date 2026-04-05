import HarakaCandidateCard from "./HarakaCandidateCard";

interface Props {
  results: any[];
}

export default function HarakaResults({ results }: Props) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {results.map((candidate) => (
        <HarakaCandidateCard key={candidate.id} candidate={candidate} />
      ))}
    </div>
  );
}