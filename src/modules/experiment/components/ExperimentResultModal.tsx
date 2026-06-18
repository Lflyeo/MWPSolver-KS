import { formatDuration } from '../utils/computeExperimentStats';
import { isGuideFlow } from '../constants/guideFlow';
import type { ExperimentResultSummary } from '../types/experiment';
import { ExperimentOverlayShell } from './ExperimentOverlayShell';

interface ExperimentResultModalProps {
  open: boolean;
  result: ExperimentResultSummary | null;
  onClose: () => void;
}

export function ExperimentResultModal({ open, result, onClose }: ExperimentResultModalProps) {
  const practice = result ? isGuideFlow(result.flowId) : false;

  return (
    <ExperimentOverlayShell show={open && !!result} backdropClassName="bg-black/40">
      {result && (
        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
          <div className="shrink-0 px-5 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">{practice ? '练习完成' : '实验结果'}</h2>
            <p className="text-sm text-gray-500 mt-1">{result.flowName}</p>
            {practice && (
              <p className="text-sm text-amber-700 mt-2">您已熟悉实验流程，可从首页选择正式实验流参加测试。</p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-gray-50 px-3 py-2">
                <div className="text-gray-500">总作答时间</div>
                <div className="font-medium text-gray-900 mt-1">{formatDuration(result.totalAnswerMs)}</div>
              </div>
              <div className="rounded-lg bg-gray-50 px-3 py-2">
                <div className="text-gray-500">平均每题</div>
                <div className="font-medium text-gray-900 mt-1">{formatDuration(result.averageAnswerMs)}</div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">各题作答时间</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-2 px-3 font-medium text-gray-600">题号</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-600">题目</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-600">用时</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.perQuestion.map((item) => (
                      <tr key={item.questionId} className="border-t border-gray-100">
                        <td className="py-2 px-3 text-gray-600">{item.index}</td>
                        <td className="py-2 px-3 text-gray-800">{item.title || item.questionId}</td>
                        <td className="py-2 px-3 text-right text-gray-800">{formatDuration(item.durationMs)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="shrink-0 px-5 py-4 border-t border-gray-100 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors duration-150"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </ExperimentOverlayShell>
  );
}
