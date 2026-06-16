import { toPng } from 'html-to-image';

async function waitForPaint(): Promise<void> {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

export async function captureElementSnapshot(element: HTMLElement): Promise<string> {
  await waitForPaint();
  try {
    return await toPng(element, {
      cacheBust: true,
      pixelRatio: 1,
      backgroundColor: '#f0f0ef',
    });
  } catch {
    const canvas = element.querySelector('canvas');
    if (canvas instanceof HTMLCanvasElement) {
      return canvas.toDataURL('image/png');
    }
    throw new Error('屏幕快照生成失败');
  }
}

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}
