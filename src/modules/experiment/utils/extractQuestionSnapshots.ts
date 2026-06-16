import type { ExperimentData, EventRecord } from '../types/experiment';

export type QuestionSnapshotView = {
  questionId: string;
  index: number;
  url: string;
  capturedAt?: number;
};

function snapshotFromEvents(events: EventRecord[]): { url: string; capturedAt?: number } | null {
  for (let i = events.length - 1; i >= 0; i -= 1) {
    const event = events[i];
    if (event.type !== 'question_snapshot') continue;
    const url = typeof event.data?.url === 'string' ? event.data.url : '';
    if (url) return { url, capturedAt: event.timestamp };
  }
  return null;
}

function normalizeQuestionEntry(raw: unknown, index: number): QuestionSnapshotView | null {
  if (!raw || typeof raw !== 'object') return null;
  const q = raw as ExperimentData & { question_id?: string; screen_snapshot?: string };
  const questionId = String(q.questionId ?? q.question_id ?? '');
  const directUrl = typeof q.screenSnapshot === 'string' ? q.screenSnapshot : typeof q.screen_snapshot === 'string' ? q.screen_snapshot : '';
  const fromEvent = Array.isArray(q.events) ? snapshotFromEvents(q.events) : null;
  const url = directUrl || fromEvent?.url || '';
  if (!url) return null;
  return {
    questionId,
    index: index + 1,
    url,
    capturedAt: fromEvent?.capturedAt,
  };
}

/** 从会话 payload 中提取各题屏幕快照 */
export function extractQuestionSnapshots(payload: Record<string, unknown>): QuestionSnapshotView[] {
  const questions = payload.questions;
  if (!Array.isArray(questions)) return [];
  return questions
    .map((q, index) => normalizeQuestionEntry(q, index))
    .filter((item): item is QuestionSnapshotView => item !== null);
}
