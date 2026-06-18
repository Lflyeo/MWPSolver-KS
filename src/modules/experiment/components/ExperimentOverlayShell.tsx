import type { ReactNode } from 'react';
import { useOverlayTransition } from '../hooks/useOverlayTransition';

interface ExperimentOverlayShellProps {
  show: boolean;
  children: ReactNode;
  className?: string;
  backdropClassName?: string;
  zIndexClassName?: string;
  align?: 'center' | 'stretch';
}

export function ExperimentOverlayShell({
  show,
  children,
  className = '',
  backdropClassName = 'bg-neutral-900/80',
  zIndexClassName = 'z-50',
  align = 'center',
}: ExperimentOverlayShellProps) {
  const { mounted, visible } = useOverlayTransition(show);

  if (!mounted) return null;

  return (
    <div
      className={`experiment-overlay-root fixed inset-0 ${zIndexClassName} ${
        align === 'center' ? 'flex items-center justify-center p-4' : ''
      } ${className}`}
      aria-hidden={!show}
    >
      <div
        className={`experiment-overlay-backdrop absolute inset-0 ${backdropClassName} ${
          visible ? 'is-visible' : ''
        }`}
      />
      <div
        className={`experiment-overlay-content relative w-full ${
          align === 'center' ? 'flex items-center justify-center' : 'h-full'
        } ${visible ? 'is-visible' : ''}`}
      >
        {children}
      </div>
    </div>
  );
}
