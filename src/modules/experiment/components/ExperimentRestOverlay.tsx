import { useEffect, useState } from 'react';
import { ExperimentOverlayShell } from './ExperimentOverlayShell';

interface ExperimentRestOverlayProps {
  show: boolean;
  seconds: number;
  nextQuestionIndex: number;
  totalQuestions: number;
  onComplete: () => void;
}

export function ExperimentRestOverlay({
  show,
  seconds,
  nextQuestionIndex,
  totalQuestions,
  onComplete,
}: ExperimentRestOverlayProps) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (!show) return;
    setRemaining(seconds);
  }, [seconds, show]);

  useEffect(() => {
    if (!show) return;
    if (remaining <= 0) {
      onComplete();
      return;
    }
    const timer = window.setTimeout(() => setRemaining((v) => v - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [onComplete, remaining, show]);

  return (
    <ExperimentOverlayShell show={show} backdropClassName="bg-neutral-900/85">
      <div className="text-center text-white px-6">
        <div
          key={remaining}
          className="text-5xl font-medium mb-4 experiment-fade-in"
        >
          {Math.max(remaining, 0)}
        </div>
        <p className="text-lg mb-2">休息 {seconds} 秒，即将开始下一道题</p>
        <p className="text-sm text-neutral-300">
          第 {nextQuestionIndex} / {totalQuestions} 题
        </p>
      </div>
    </ExperimentOverlayShell>
  );
}
