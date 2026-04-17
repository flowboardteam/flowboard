import { useState } from "react";
import { intentExtractor } from "../../../lib/haraka/intentExtractor";
import ChatInput from "../../../components/haraka/ChatInput";

interface Props {
  onSpecGenerated: (spec: any) => void;
}

export default function HarakaChat({ onSpecGenerated }: Props) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (prompt: string) => {
    setLoading(true);
    const spec = await intentExtractor(prompt);
    onSpecGenerated(spec);
    setLoading(false);
  };

  return (
    <div className="bg-[var(--sidebar-bg)] p-6 rounded-none border border-[var(--border-color)]">
      <ChatInput onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}