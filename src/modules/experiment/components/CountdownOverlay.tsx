import { type RefObject, useEffect, useState } from 'react';

const STEPS = ['3', '2', '1', '开始'] as const;
const STEP_MS = 1000;

export type CountdownStepIndex = 0 | 1 | 2 | 3;

interface CountdownOverlayProps {
  onComplete: () => void;
  displayRef?: RefObject<HTMLSpanElement | null>;
  onStepChange?: (stepIndex: CountdownStepIndex, label: (typeof STEPS)[number]) => void;
}

export function CountdownOverlay({ onComplete, displayRef, onStepChange }: CountdownOverlayProps) {
  const [stepIndex, setStepIndex] = useState<CountdownStepIndex>(0);
  const label = STEPS[stepIndex];
  const isDigit = label.length === 1;

  useEffect(() => {
    onStepChange?.(stepIndex, label);
  }, [label, onStepChange, stepIndex]);

  useEffect(() => {
    if (stepIndex >= STEPS.length - 1) {
      const timer = window.setTimeout(onComplete, STEP_MS);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => setStepIndex((i) => (i + 1) as CountdownStepIndex), STEP_MS);
    return () => window.clearTimeout(timer);
  }, [stepIndex, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/85">
      <span ref={displayRef} className="inline-block w-fit leading-none">
        <span
          key={stepIndex}
          className={`experiment-countdown block text-7xl font-medium text-white experiment-fade-in ${
            isDigit ? 'tracking-widest' : 'tracking-normal'
          }`}
        >
          {label}
        </span>
      </span>
    </div>
  );
}
