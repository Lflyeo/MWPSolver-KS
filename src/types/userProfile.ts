/** 用户扩展资料字段（前后端共用命名） */
export interface UserProfileFields {
  real_name?: string | null;
  age?: number | null;
  gender?: string | null;
  contact?: string | null;
  college?: string | null;
  major?: string | null;
  student_id?: string | null;
}

export const GENDER_OPTIONS = ['男', '女', '其他', '不愿透露'] as const;

export const EMPTY_PROFILE: UserProfileFields = {
  real_name: '',
  age: null,
  gender: '',
  contact: '',
  college: '',
  major: '',
  student_id: '',
};

export function profileFromUser(user: Partial<UserProfileFields> | null | undefined): UserProfileFields {
  if (!user) return { ...EMPTY_PROFILE };
  return {
    real_name: user.real_name ?? '',
    age: user.age ?? null,
    gender: user.gender ?? '',
    contact: user.contact ?? '',
    college: user.college ?? '',
    major: user.major ?? '',
    student_id: user.student_id ?? '',
  };
}

export function profileToPayload(profile: UserProfileFields): UserProfileFields {
  const ageRaw = profile.age;
  const age =
    ageRaw === null || ageRaw === undefined || ageRaw === ('' as unknown as number)
      ? undefined
      : Number(ageRaw);
  return {
    real_name: profile.real_name?.trim() || undefined,
    age: age && !Number.isNaN(age) ? age : undefined,
    gender: profile.gender?.trim() || undefined,
    contact: profile.contact?.trim() || undefined,
    college: profile.college?.trim() || undefined,
    major: profile.major?.trim() || undefined,
    student_id: profile.student_id?.trim() || undefined,
  };
}

/** 对外展示姓名（优先 real_name，兼容旧数据 username） */
export function getUserDisplayName(user: {
  real_name?: string | null;
  username?: string | null;
} | null | undefined): string {
  if (!user) return '未填写姓名';
  return user.real_name?.trim() || user.username?.trim() || '未填写姓名';
}

/** 管理端/列表中展示用户标识 */
export function formatUserLabel(user: {
  username?: string | null;
  real_name?: string | null;
  student_id?: string | null;
} | null | undefined): string {
  if (!user) return '匿名';
  const name = getUserDisplayName(user);
  if (name === '未填写姓名') return '匿名';
  const parts = [name];
  if (user.student_id?.trim()) parts.push(`学号 ${user.student_id.trim()}`);
  return parts.join(' · ');
}

export function formatUserProfileSummary(user: UserProfileFields | null | undefined): string {
  if (!user) return '';
  const parts: string[] = [];
  if (user.college?.trim()) parts.push(user.college.trim());
  if (user.major?.trim()) parts.push(user.major.trim());
  if (user.age != null) parts.push(`${user.age} 岁`);
  if (user.gender?.trim()) parts.push(user.gender.trim());
  return parts.join(' · ');
}

export function hasUserIdentity(user: {
  username?: string | null;
  real_name?: string | null;
} | null | undefined): boolean {
  if (!user) return false;
  return !!(user.real_name?.trim() || user.username?.trim());
}
