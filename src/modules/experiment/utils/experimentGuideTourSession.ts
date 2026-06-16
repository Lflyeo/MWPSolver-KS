/** 用户勾选「不再显示」后永久关闭自动指引（按用户存储） */
export const EXPERIMENT_GUIDE_DISMISSED_KEY = 'experiment_guide_tour_dismissed';

const SESSION_KEY = 'experiment_guide_tour_session';
const LOGIN_SESSION_KEY = 'experiment_guide_tour_login_session';
const AUTO_SHOWN_SESSION_KEY = 'experiment_guide_tour_auto_shown_session';

export type GuideTourSession = {
  active: boolean;
  stepIndex: number;
};

function dismissedKeyForUser(userId: string): string {
  return `${EXPERIMENT_GUIDE_DISMISSED_KEY}_${userId}`;
}

export function loadGuideTourSession(): GuideTourSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GuideTourSession;
    if (typeof parsed.active !== 'boolean' || typeof parsed.stepIndex !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveGuideTourSession(session: GuideTourSession): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearGuideTourSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

export function isGuideTourDismissedPermanently(userId?: string | null): boolean {
  if (userId) {
    return localStorage.getItem(dismissedKeyForUser(userId)) === '1';
  }
  return localStorage.getItem(EXPERIMENT_GUIDE_DISMISSED_KEY) === '1';
}

export function markGuideTourDismissedPermanently(userId: string): void {
  localStorage.setItem(dismissedKeyForUser(userId), '1');
}

/** 登录/注册成功后调用，标记新的登录会话 */
export function beginGuideTourLoginSession(userId: string): void {
  localStorage.setItem(LOGIN_SESSION_KEY, `${userId}:${Date.now()}`);
  localStorage.removeItem(AUTO_SHOWN_SESSION_KEY);
}

function getGuideTourLoginSession(): string | null {
  return localStorage.getItem(LOGIN_SESSION_KEY);
}

/** 当前登录会话内是否已自动展示过分步指引 */
export function isGuideTourAutoShownForUser(userId: string): boolean {
  const loginSession = getGuideTourLoginSession();
  const shownSession = localStorage.getItem(AUTO_SHOWN_SESSION_KEY);
  return !!loginSession && loginSession.startsWith(`${userId}:`) && loginSession === shownSession;
}

export function markGuideTourAutoShown(userId: string): void {
  const loginSession = getGuideTourLoginSession();
  if (loginSession?.startsWith(`${userId}:`)) {
    localStorage.setItem(AUTO_SHOWN_SESSION_KEY, loginSession);
  }
}

/** 刷新后恢复登录态时，确保存在登录会话标记 */
export function ensureGuideTourLoginSession(userId: string): void {
  const loginSession = getGuideTourLoginSession();
  if (!loginSession?.startsWith(`${userId}:`)) {
    localStorage.setItem(LOGIN_SESSION_KEY, `${userId}:${Date.now()}`);
  }
}

export function clearGuideTourOnLogout(): void {
  clearGuideTourSession();
  localStorage.removeItem(LOGIN_SESSION_KEY);
  localStorage.removeItem(AUTO_SHOWN_SESSION_KEY);
}
