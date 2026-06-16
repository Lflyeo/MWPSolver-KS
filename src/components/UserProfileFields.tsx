import type { UserProfileFields } from '@/types/userProfile';
import { GENDER_OPTIONS } from '@/types/userProfile';

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

export function UserProfileFormFields(props: {
  value: UserProfileFields;
  onChange: (next: UserProfileFields) => void;
  disabled?: boolean;
  variant?: 'user' | 'admin';
  hideRealName?: boolean;
}) {
  const { value, onChange, disabled, variant = 'user', hideRealName = false } = props;
  const borderClass = variant === 'admin' ? 'border-slate-200 focus:ring-slate-400' : '';

  const set = (patch: Partial<UserProfileFields>) => onChange({ ...value, ...patch });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {!hideRealName && (
        <div>
          <label className={labelClass}>姓名</label>
          <input
            type="text"
            value={value.real_name ?? ''}
            onChange={(e) => set({ real_name: e.target.value })}
            disabled={disabled}
            className={`${inputClass} ${borderClass}`}
            maxLength={64}
            placeholder="真实姓名"
          />
        </div>
      )}
      <div>
        <label className={labelClass}>学号</label>
        <input
          type="text"
          value={value.student_id ?? ''}
          onChange={(e) => set({ student_id: e.target.value })}
          disabled={disabled}
          className={`${inputClass} ${borderClass}`}
          maxLength={64}
          placeholder="学号"
        />
      </div>
      <div>
        <label className={labelClass}>年龄</label>
        <input
          type="number"
          min={1}
          max={150}
          value={value.age ?? ''}
          onChange={(e) => set({ age: e.target.value ? Number(e.target.value) : null })}
          disabled={disabled}
          className={`${inputClass} ${borderClass}`}
          placeholder="年龄"
        />
      </div>
      <div>
        <label className={labelClass}>性别</label>
        <select
          value={value.gender ?? ''}
          onChange={(e) => set({ gender: e.target.value })}
          disabled={disabled}
          className={`${inputClass} ${borderClass}`}
        >
          <option value="">请选择</option>
          {GENDER_OPTIONS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className={labelClass}>联系方式（电话 / 微信号）</label>
        <input
          type="text"
          value={value.contact ?? ''}
          onChange={(e) => set({ contact: e.target.value })}
          disabled={disabled}
          className={`${inputClass} ${borderClass}`}
          maxLength={128}
          placeholder="手机号或微信号"
        />
      </div>
      <div>
        <label className={labelClass}>学院</label>
        <input
          type="text"
          value={value.college ?? ''}
          onChange={(e) => set({ college: e.target.value })}
          disabled={disabled}
          className={`${inputClass} ${borderClass}`}
          maxLength={128}
          placeholder="所在学院"
        />
      </div>
      <div>
        <label className={labelClass}>专业</label>
        <input
          type="text"
          value={value.major ?? ''}
          onChange={(e) => set({ major: e.target.value })}
          disabled={disabled}
          className={`${inputClass} ${borderClass}`}
          maxLength={128}
          placeholder="所学专业"
        />
      </div>
    </div>
  );
}

export function UserProfileReadonly(props: { user: UserProfileFields | null | undefined }) {
  const { user } = props;
  if (!user) return null;
  const rows = [
    ['姓名', user.real_name],
    ['学号', user.student_id],
    ['年龄', user.age != null ? String(user.age) : ''],
    ['性别', user.gender],
    ['联系方式', user.contact],
    ['学院', user.college],
    ['专业', user.major],
  ].filter(([, v]) => v != null && String(v).trim() !== '');

  if (rows.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600 mt-2">
      {rows.map(([label, val]) => (
        <div key={label}>
          <span className="text-gray-400">{label}：</span>
          {val}
        </div>
      ))}
    </div>
  );
}
