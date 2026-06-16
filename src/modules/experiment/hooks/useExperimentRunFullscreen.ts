import { useLayoutEffect } from 'react';
import { ensureExperimentImmersiveMode } from '../utils/experimentFullscreen';

/** 作答页保持沉浸式布局；原生全屏在首页点击「开始」时已进入，此处不再请求 */
export function useExperimentRunImmersive(active = true) {
  useLayoutEffect(() => {
    if (!active) return;
    ensureExperimentImmersiveMode();
  }, [active]);
}
