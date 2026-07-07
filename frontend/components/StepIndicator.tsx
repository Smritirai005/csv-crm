import { Step } from "@/lib/types";

const STEPS: { key: Step; label: string }[] = [
  { key: "upload", label: "Upload" },
  { key: "preview", label: "Preview" },
  { key: "result", label: "Result" },
];

export default function StepIndicator({ current }: { current: Step }) {
  const currentIndex = STEPS.findIndex((s) => s.key === current);

  return (
    <div className="flex items-center gap-3">
      {STEPS.map((step, i) => {
        const isDone = i < currentIndex;
        const isActive = i === currentIndex;
        return (
          <div key={step.key} className="flex items-center gap-3">
            <div
              className={[
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold border transition-colors",
                isActive
                  ? "bg-accent text-white border-accent"
                  : isDone
                  ? "bg-ink text-white border-ink"
                  : "bg-white text-ink/40 border-ink/15",
              ].join(" ")}
            >
              {i + 1}
            </div>
            <span
              className={[
                "text-sm font-medium",
                isActive ? "text-ink" : "text-ink/40",
              ].join(" ")}
            >
              {step.label}
            </span>
            {i < STEPS.length - 1 && (
              <div className="h-px w-8 bg-ink/15 ml-1" />
            )}
          </div>
        );
      })}
    </div>
  );
}
