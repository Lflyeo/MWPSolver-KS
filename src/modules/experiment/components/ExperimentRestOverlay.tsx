import { useEffect, useState } from 'react';

interface ExperimentRestOverlayProps {
  seconds: number;
  nextQuestionIndex: number;
  totalQuestions: number;
  onComplete: () => void;
}

export function ExperimentRestOverlay({
  seconds,
  nextQuestionIndex,
  totalQuestions,
  onComplete,
}: ExperimentRestOverlayProps) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (remaining <= 0) {
      onComplete();
      return;
    }
    const timer = window.setTimeout(() => setRemaining((v) => v - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [remaining, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/85">
      <div className="text-center text-white px-6">
        <div className="text-5xl font-medium mb-4">{Math.max(remaining, 0)}</div>
        <p className="text-lg mb-2">休息 {seconds} 秒，即将开始下一道题</p>
        <p className="text-sm text-neutral-300">
          第 {nextQuestionIndex} / {totalQuestions} 题
        </p>
      </div>
    </div>
  );
}
