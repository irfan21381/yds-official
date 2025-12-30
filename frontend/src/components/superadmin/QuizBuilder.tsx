 import { useState } from "react";

export default function QuizBuilder() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState<number[]>([]);

  const toggleCorrect = (i: number) => {
    setCorrect(
      correct.includes(i)
        ? correct.filter((x) => x !== i)
        : [...correct, i]
    );
  };

  return (
    <div className="space-y-4">
      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Enter question"
        className="border px-4 py-2 w-full rounded"
      />

      {options.map((opt, i) => (
        <div key={i} className="flex items-center gap-3">
          <input
            value={opt}
            onChange={(e) => {
              const copy = [...options];
              copy[i] = e.target.value;
              setOptions(copy);
            }}
            placeholder={`Option ${i + 1}`}
            className="border px-3 py-2 flex-1 rounded"
          />
          <input
            type="checkbox"
            checked={correct.includes(i)}
            onChange={() => toggleCorrect(i)}
          />
        </div>
      ))}
    </div>
  );
}