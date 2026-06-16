import { useCallback, useEffect, useLayoutEffect, useState, type RefObject } from 'react';
import { X } from 'lucide-react';
import type { ExperimentGuideTourStep, GuideTourAnchor } from '../constants/guideFlow';

type Rect = { top: number; left: number; width: number; height: number };

const SPOTLIGHT_PAD = 10;
const TOOLTIP_GAP = 14;
const TOOLTIP_MAX_W = 320;

function measureCountdownText(el: HTMLElement): Rect | null {
  const textEl = (el.firstElementChild as HTMLElement | null) ?? el;
  const range = document.createRange();
  range.selectNodeContents(textEl);
  const textRect = range.getBoundingClientRect();
  if (textRect.width > 0 && textRect.height > 0) {
    return {
      top: textRect.top,
      left: textRect.left,
      width: textRect.width,
      height: textRect.height,
    };
  }
  return measureAnchor(el, true);
}

function measureAnchor(el: HTMLElement | null, useTextBounds = false): Rect | null {
  if (!el) return null;
  if (useTextBounds) {
    const range = document.createRange();
    range.selectNodeContents(el);
    const textRect = range.getBoundingClientRect();
    if (textRect.width > 0 && textRect.height > 0) {
      return {
        top: textRect.top,
        left: textRect.left,
        width: textRect.width,
        height: textRect.height,
      };
    }
  }
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

function clampTooltip(
  tooltipW: number,
  tooltipH: number,
  placement: NonNullable<ExperimentGuideTourStep['placement']>,
  anchor: Rect,
): { top: number; left: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let top = 0;
  let left = 0;

  switch (placement) {
    case 'bottom':
      top = anchor.top + anchor.height + SPOTLIGHT_PAD + TOOLTIP_GAP;
      left = anchor.left + anchor.width / 2 - tooltipW / 2;
      break;
    case 'top':
      top = anchor.top - SPOTLIGHT_PAD - TOOLTIP_GAP - tooltipH;
      left = anchor.left + anchor.width / 2 - tooltipW / 2;
      break;
    case 'left':
      top = anchor.top + anchor.height / 2 - tooltipH / 2;
      left = anchor.left - SPOTLIGHT_PAD - TOOLTIP_GAP - tooltipW;
      break;
    case 'right':
      top = anchor.top + anchor.height / 2 - tooltipH / 2;
      left = anchor.left + anchor.width + SPOTLIGHT_PAD + TOOLTIP_GAP;
      break;
  }

  left = Math.max(12, Math.min(left, vw - tooltipW - 12));
  top = Math.max(12, Math.min(top, vh - tooltipH - 12));
  return { top, left };
}

interface ExperimentGuideTourProps {
  open: boolean;
  stepIndex: number;
  steps: ExperimentGuideTourStep[];
  anchors: Partial<Record<GuideTourAnchor, RefObject<HTMLElement | null>>>;
  /** 锚点内容变化时递增，用于触发重新测量（如倒计时 3→2→1→开始） */
  anchorRemeasureKey?: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: (dismissPermanently: boolean) => void;
}

export function ExperimentGuideTour({
  open,
  stepIndex,
  steps,
  anchors,
  anchorRemeasureKey = 0,
  onNext,
  onPrev,
  onClose,
}: ExperimentGuideTourProps) {
  const step = steps[stepIndex];
  const [anchorRect, setAnchorRect] = useState<Rect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);
  const [dismissPermanently, setDismissPermanently] = useState(false);
  const isCenter = !step?.anchor;
  const isLast = stepIndex >= steps.length - 1;
  const isFirst = stepIndex <= 0;

  const remeasure = useCallback(() => {
    if (!open || !step) return;
    if (!step.anchor) {
      setAnchorRect(null);
      setTooltipPos(null);
      return;
    }
    const el = anchors[step.anchor]?.current ?? null;
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    const rect = step.id === 'countdown' && el ? measureCountdownText(el) : measureAnchor(el);
    setAnchorRect(rect);
    if (rect && step.placement) {
      setTooltipPos(clampTooltip(TOOLTIP_MAX_W, 200, step.placement, rect));
    }
  }, [anchors, open, step]);

  useLayoutEffect(() => {
    remeasure();
    const el = step?.anchor ? (anchors[step.anchor]?.current ?? null) : null;
    if (!el) {
      const timer = window.setTimeout(remeasure, 120);
      return () => window.clearTimeout(timer);
    }
    const observer = new ResizeObserver(() => remeasure());
    observer.observe(el);
    const timer = window.setTimeout(remeasure, 120);
    const fadeTimer = step?.id === 'countdown' ? window.setTimeout(remeasure, 200) : undefined;
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
      if (fadeTimer !== undefined) window.clearTimeout(fadeTimer);
    };
  }, [anchors, remeasure, step?.anchor, step?.id, stepIndex, anchorRemeasureKey]);

  useEffect(() => {
    if (!open) return;
    const onResize = () => remeasure();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [open, remeasure]);

  useEffect(() => {
    if (open) return;
    setDismissPermanently(false);
  }, [open]);

  if (!open || !step) return null;

  const handleClose = () => onClose(dismissPermanently);

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label="实验操作指引">
      {!isCenter && anchorRect && (
        <div
          className="fixed rounded-xl pointer-events-none ring-2 ring-amber-400 ring-offset-2 ring-offset-transparent transition-all duration-200"
          style={{
            top: anchorRect.top - SPOTLIGHT_PAD,
            left: anchorRect.left - SPOTLIGHT_PAD,
            width: anchorRect.width + SPOTLIGHT_PAD * 2,
            height: anchorRect.height + SPOTLIGHT_PAD * 2,
            boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.58)',
          }}
        />
      )}

      {isCenter && <div className="fixed inset-0 bg-slate-900/58" />}

      <div
        className={`fixed z-[81] w-full max-w-sm bg-white rounded-xl shadow-2xl border border-amber-100 overflow-hidden ${
          isCenter ? 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 mx-4' : ''
        }`}
        style={
          !isCenter && tooltipPos
            ? { top: tooltipPos.top, left: tooltipPos.left, width: TOOLTIP_MAX_W, maxWidth: 'calc(100vw - 24px)' }
            : !isCenter
              ? { visibility: 'hidden' }
              : undefined
        }
      >
        <div className="flex items-start justify-between gap-2 px-4 pt-4 pb-2 border-b border-gray-100">
          <div>
            <p className="text-xs font-medium text-amber-700">
              指引 {stepIndex + 1} / {steps.length}
            </p>
            <h3 className="text-base font-semibold text-gray-900 mt-0.5">{step.title}</h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 shrink-0"
            aria-label="关闭指引"
          >
            <X size={18} />
          </button>
        </div>
        <p className="px-4 py-3 text-sm text-gray-600 leading-relaxed">{step.content}</p>
        <label className="px-4 pb-2 flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={dismissPermanently}
            onChange={(e) => setDismissPermanently(e.target.checked)}
            className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
          />
          <span className="text-xs text-gray-500">不再自动显示操作指引</span>
        </label>
        <div className="px-4 pb-4 flex items-center justify-between gap-2">
          <button type="button" onClick={handleClose} className="text-sm text-gray-500 hover:text-gray-700">
            跳过
          </button>
          <div className="flex gap-2">
            {!isFirst && (
              <button
                type="button"
                onClick={onPrev}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
              >
                上一步
              </button>
            )}
            <button
              type="button"
              onClick={isLast ? handleClose : onNext}
              className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700"
            >
              {isLast ? '完成' : '下一步'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
