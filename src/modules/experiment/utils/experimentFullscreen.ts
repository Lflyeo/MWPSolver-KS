import { EXPERIMENT_USE_NATIVE_FULLSCREEN } from '../constants/experimentDisplay';

export const EXPERIMENT_IMMERSIVE_CLASS = 'experiment-run-fullscreen';

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void>;
};

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: (options?: FullscreenOptions) => Promise<void>;
};

export function isNativeFullscreenActive(): boolean {
  const doc = document as FullscreenDocument;
  return !!(doc.fullscreenElement ?? doc.webkitFullscreenElement);
}

export function applyExperimentImmersiveMode(): void {
  document.documentElement.classList.add(EXPERIMENT_IMMERSIVE_CLASS);
  document.body.classList.add(EXPERIMENT_IMMERSIVE_CLASS);
}

export function removeExperimentImmersiveMode(): void {
  document.documentElement.classList.remove(EXPERIMENT_IMMERSIVE_CLASS);
  document.body.classList.remove(EXPERIMENT_IMMERSIVE_CLASS);
}

async function requestNativeFullscreen(el: HTMLElement): Promise<boolean> {
  try {
    if (isNativeFullscreenActive()) return true;
    const target = el as FullscreenElement;
    const options: FullscreenOptions = { navigationUI: 'hide' };
    if (target.requestFullscreen) {
      await target.requestFullscreen(options);
    } else if (target.webkitRequestFullscreen) {
      await target.webkitRequestFullscreen();
    } else {
      return false;
    }
    return isNativeFullscreenActive();
  } catch {
    return false;
  }
}

async function exitNativeFullscreen(): Promise<void> {
  try {
    if (!isNativeFullscreenActive()) return;
    const doc = document as FullscreenDocument;
    if (doc.exitFullscreen) {
      await doc.exitFullscreen();
    } else if (doc.webkitExitFullscreen) {
      await doc.webkitExitFullscreen();
    }
  } catch {
    // 用户可能已按 Esc 退出
  }
}

/** 在用户点击「开始」等手势后调用：进入沉浸式 + 可选原生全屏 */
export async function enterExperimentFullscreen(container?: HTMLElement | null): Promise<boolean> {
  applyExperimentImmersiveMode();
  if (!EXPERIMENT_USE_NATIVE_FULLSCREEN) return true;
  const target = container ?? document.documentElement;
  return requestNativeFullscreen(target);
}

/** 取消开始或实验结束后退出全屏 */
export async function exitExperimentFullscreen(): Promise<void> {
  await exitNativeFullscreen();
  removeExperimentImmersiveMode();
}

/** 作答页挂载时确保沉浸式样式（不重复请求原生全屏） */
export function ensureExperimentImmersiveMode(): void {
  applyExperimentImmersiveMode();
}
