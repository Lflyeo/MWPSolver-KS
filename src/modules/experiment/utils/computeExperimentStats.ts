import type { ExperimentResultSummary, ExperimentSession, QuestionItem } from '../types/experiment';

function formatDuration(ms: number): string {
  if (ms <= 0) return '0 秒';
  const totalSec = Math.round(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min > 0) return `${min} 分 ${sec} 秒`;
  return `${sec} 秒`;
}

export function computeExperimentStats(
  session: ExperimentSession,
  questions: QuestionItem[],
  flowName: string,
): ExperimentResultSummary {
  const perQuestion = questions.map((q, idx) => {
    const qData = session.questions.find((item) => item.questionId === q.id);
    let durationMs = qData?.answerDurationMs ?? 0;
    if (!durationMs && qData) {
      const start = qData.events.find((e) => e.type === 'question_start')?.timestamp;
      const end = qData.events.find((e) => e.type === 'question_end')?.timestamp;
      if (start && end) durationMs = end - start;
    }
    return {
      questionId: q.id,
      title: q.title,
      index: idx + 1,
      durationMs,
    };
  });

  const totalAnswerMs = perQuestion.reduce((sum, item) => sum + item.durationMs, 0);
  const averageAnswerMs = perQuestion.length > 0 ? Math.round(totalAnswerMs / perQuestion.length) : 0;

  return {
    sessionId: session.sessionId,
    flowId: session.flowId,
    flowName,
    perQuestion,
    totalAnswerMs,
    averageAnswerMs,
  };
}

export { formatDuration };
