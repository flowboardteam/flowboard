import { useState } from "react";

interface Props {
  onSubmit: (value: string) => void;
  loading: boolean;
}

export default function ChatInput({ onSubmit, loading }: Props) {
  const [value, setValue] = useState("");

  return (
    <div className="space-y-4">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Describe the talent you are looking for..."
        className="w-full h-32 bg-[var(--bg-main)] p-4 rounded-none border border-[var(--border-color)]"
      />

      <button
        onClick={() => onSubmit(value)}
        disabled={loading || !value}
        className="bg-emerald-500 px-6 py-3 rounded-none font-bold text-white"
      >
        {loading ? "Analyzing..." : "Generate Hiring Spec"}
      </button>
    </div>
  );
}