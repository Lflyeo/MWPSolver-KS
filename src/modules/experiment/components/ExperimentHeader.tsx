import type { ExperimentStatus } from '../types/experiment';

interface ExperimentHeaderProps {
  title: string;
  flowName?: string;
  status: ExperimentStatus;
  questionLabel: string;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onNext: () => void;
  onEnd: () => void;
  onBack?: () => void;
  isLastQuestion: boolean;
}

export function ExperimentHeader({
  title,
  flowName,
  status,
  questionLabel,
  onStart,
  onPause,
  onResume,
  onNext,
  onEnd,
  onBack,
  isLastQuestion,
}: ExperimentHeaderProps) {
  const statusLabel: Record<ExperimentStatus, string> = {
    idle: '未开始',
    running: '进行中',
    paused: '已暂停',
    ended: '已结束',
  };

  return (
    <header className="shrink-0 border-b border-neutral-200 bg-[#f7f7f6] px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-lg font-medium tracking-tight text-neutral-900 truncate">{title}</h1>
          <p className="mt-0.5 text-xs text-neutral-500">
            {flowName && (
              <>
                <span>{flowName}</span>
                <span className="mx-2 text-neutral-300">|</span>
              </>
            )}
            {questionLabel}
            <span className="mx-2 text-neutral-300">|</span>
            状态：{statusLabel[status]}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onBack && status === 'idle' && (
            <button type="button" onClick={onBack} className="experiment-btn experiment-btn--secondary">
              更换实验流
            </button>
          )}
          {status === 'idle' && (
            <button type="button" onClick={onStart} className="experiment-btn experiment-btn--primary">
              开始实验
            </button>
          )}

          {status === 'running' && (
            <>
              <button type="button" onClick={onPause} className="experiment-btn experiment-btn--secondary">
                暂停
              </button>
              {!isLastQuestion && (
                <button type="button" onClick={onNext} className="experiment-btn experiment-btn--secondary">
                  下一题
                </button>
              )}
              <button type="button" onClick={onEnd} className="experiment-btn experiment-btn--danger">
                结束实验
              </button>
            </>
          )}

          {status === 'paused' && (
            <>
              <button type="button" onClick={onResume} className="experiment-btn experiment-btn--primary">
                继续
              </button>
              {!isLastQuestion && (
                <button type="button" onClick={onNext} className="experiment-btn experiment-btn--secondary">
                  下一题
                </button>
              )}
              <button type="button" onClick={onEnd} className="experiment-btn experiment-btn--danger">
                结束实验
              </button>
            </>
          )}

          {status === 'ended' && (
            <button type="button" onClick={onStart} className="experiment-btn experiment-btn--secondary">
              重新开始
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
