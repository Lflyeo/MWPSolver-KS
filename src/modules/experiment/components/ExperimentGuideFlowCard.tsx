import { BookOpen, HelpCircle, Pin } from 'lucide-react';
import type { RefObject } from 'react';
import type { ExperimentFlow } from '../types/experiment';

interface ExperimentGuideFlowCardProps {
  flow: ExperimentFlow;
  cardRef: RefObject<HTMLDivElement | null>;
  startButtonRef: RefObject<HTMLButtonElement | null>;
  onStart: (flow: ExperimentFlow) => void;
  onShowGuide: () => void;
}

export function ExperimentGuideFlowCard({
  flow,
  cardRef,
  startButtonRef,
  onStart,
  onShowGuide,
}: ExperimentGuideFlowCardProps) {
  return (
    <div
      ref={cardRef}
      className="sticky top-0 z-10 mb-4 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white shadow-sm"
    >
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="mt-0.5 shrink-0 w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
              <BookOpen size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-gray-900">{flow.name}</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-medium">
                  <Pin size={12} />
                  置顶
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                {flow.description || '通过短练习熟悉实验流程与按键操作，再参加正式实验。'}
              </p>
              <p className="mt-2 text-xs text-amber-700/80">
                共 {flow.question_count ?? 0} 道练习题 · 题间休息 {flow.rest_break_seconds ?? 3} 秒
              </p>
              <button
                type="button"
                onClick={onShowGuide}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-amber-800 hover:text-amber-900 underline-offset-2 hover:underline"
              >
                <HelpCircle size={16} />
                查看分步操作指引
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-2 shrink-0 mt-1">
            <button
              ref={startButtonRef}
              type="button"
              onClick={() => onStart(flow)}
              className="px-4 py-2 rounded-xl bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors"
            >
              开始练习
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
