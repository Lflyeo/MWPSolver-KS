import { Eraser, Undo2 } from 'lucide-react';

interface DrawingToolbarProps {
  onUndo: () => void;
  onClear: () => void;
  canUndo: boolean;
  disabled?: boolean;
}

export function DrawingToolbar({ onUndo, onClear, canUndo, disabled }: DrawingToolbarProps) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <button
        type="button"
        onClick={onUndo}
        disabled={disabled || !canUndo}
        className="experiment-btn experiment-btn--secondary inline-flex items-center gap-1.5"
        title="撤销上一笔"
      >
        <Undo2 size={14} />
        撤销
      </button>
      <button
        type="button"
        onClick={onClear}
        disabled={disabled}
        className="experiment-btn experiment-btn--secondary inline-flex items-center gap-1.5"
        title="清空作答区域"
      >
        <Eraser size={14} />
        清空
      </button>
    </div>
  );
}
