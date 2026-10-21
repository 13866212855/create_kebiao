export type SectionType = 'morning' | 'afternoon' | 'evening';

export interface Period {
  id: string;
  section: SectionType;
  periodNumber: number;
  name: string;
  startTime: string;
  endTime: string;
}

export interface CourseCell {
  courseName: string;
  className: string;
  classroom?: string;
  weeks?: string; // e.g. "每周", "单周", "双周"
  color?: string; // hex color for cell styling
  teacherNote?: string;
}

export interface LastUsedCourseConfig {
  courseName: string;
  className?: string;
  classroom?: string;
  weeks?: string;
  color?: string;
}

export interface DayInfo {
  dayOfWeek: number; // 1 = Monday, 7 = Sunday
  label: string;
  shortLabel: string;
}

export interface TimetableConfig {
  teacherName: string;
  academicYear: string;
  schoolName: string;
  gradeSubject: string;
  remarks: string;
  includeWeekend: boolean;
  periods: Period[];
}

export interface TimetableState {
  config: TimetableConfig;
  // Key format: `${dayOfWeek}_${periodId}` e.g. "1_m1"
  schedule: Record<string, CourseCell>;
}

export interface ColorPreset {
  id: string;
  name: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  badgeClass: string;
  hex: string;
  excelFill: string; // ARGB format like 'FFE0F2FE'
  excelText: string; // ARGB format like 'FF0369A1'
}

export const COLOR_PRESETS: ColorPreset[] = [
  {
    id: 'blue',
    name: '海蓝',
    bgClass: 'bg-blue-50 hover:bg-blue-100/80',
    borderClass: 'border-blue-300',
    textClass: 'text-blue-900',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
    hex: '#3b82f6',
    excelFill: 'FFE0F2FE',
    excelText: 'FF0369A1',
  },
  {
    id: 'emerald',
    name: '翠绿',
    bgClass: 'bg-emerald-50 hover:bg-emerald-100/80',
    borderClass: 'border-emerald-300',
    textClass: 'text-emerald-900',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    hex: '#10b981',
    excelFill: 'FFDCFCE7',
    excelText: 'FF15803D',
  },
  {
    id: 'amber',
    name: '暖橙',
    bgClass: 'bg-amber-50 hover:bg-amber-100/80',
    borderClass: 'border-amber-300',
    textClass: 'text-amber-900',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    hex: '#f59e0b',
    excelFill: 'FFFEF3C7',
    excelText: 'FFB45309',
  },
  {
    id: 'purple',
    name: '丁香紫',
    bgClass: 'bg-purple-50 hover:bg-purple-100/80',
    borderClass: 'border-purple-300',
    textClass: 'text-purple-900',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
    hex: '#8b5cf6',
    excelFill: 'FFF3E8FF',
    excelText: 'FF6B21A8',
  },
  {
    id: 'rose',
    name: '樱花粉',
    bgClass: 'bg-rose-50 hover:bg-rose-100/80',
    borderClass: 'border-rose-300',
    textClass: 'text-rose-900',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
    hex: '#f43f5e',
    excelFill: 'FFFFE4E6',
    excelText: 'FFBE123C',
  },
  {
    id: 'teal',
    name: '松石青',
    bgClass: 'bg-teal-50 hover:bg-teal-100/80',
    borderClass: 'border-teal-300',
    textClass: 'text-teal-900',
    badgeClass: 'bg-teal-100 text-teal-800 border-teal-200',
    hex: '#14b8a6',
    excelFill: 'FFCCFBF1',
    excelText: 'FF0F766E',
  },
  {
    id: 'indigo',
    name: '雅致靛蓝',
    bgClass: 'bg-indigo-50 hover:bg-indigo-100/80',
    borderClass: 'border-indigo-300',
    textClass: 'text-indigo-900',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    hex: '#6366f1',
    excelFill: 'FFE0E7FF',
    excelText: 'FF3730A3',
  },
  {
    id: 'cyan',
    name: '天青色',
    bgClass: 'bg-cyan-50 hover:bg-cyan-100/80',
    borderClass: 'border-cyan-300',
    textClass: 'text-cyan-900',
    badgeClass: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    hex: '#06b6d4',
    excelFill: 'FFCFFAFE',
    excelText: 'FF0E7490',
  },
  {
    id: 'violet',
    name: '罗兰紫',
    bgClass: 'bg-violet-50 hover:bg-violet-100/80',
    borderClass: 'border-violet-300',
    textClass: 'text-violet-900',
    badgeClass: 'bg-violet-100 text-violet-800 border-violet-200',
    hex: '#7c3aed',
    excelFill: 'FFEDE9FE',
    excelText: 'FF5B21B6',
  },
  {
    id: 'orange',
    name: '珊瑚橘',
    bgClass: 'bg-orange-50 hover:bg-orange-100/80',
    borderClass: 'border-orange-300',
    textClass: 'text-orange-900',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-200',
    hex: '#ea580c',
    excelFill: 'FFFFEDD5',
    excelText: 'FFC2410C',
  },
];

export const DAYS_CONFIG: DayInfo[] = [
  { dayOfWeek: 1, label: '星期一', shortLabel: '周一' },
  { dayOfWeek: 2, label: '星期二', shortLabel: '周二' },
  { dayOfWeek: 3, label: '星期三', shortLabel: '周三' },
  { dayOfWeek: 4, label: '星期四', shortLabel: '周四' },
  { dayOfWeek: 5, label: '星期五', shortLabel: '周五' },
  { dayOfWeek: 6, label: '星期六', shortLabel: '周六' },
  { dayOfWeek: 7, label: '星期日', shortLabel: '周日' },
];

export const DEFAULT_PERIODS: Period[] = [
  { id: 'm1', section: 'morning', periodNumber: 1, name: '第1节', startTime: '08:00', endTime: '08:45' },
  { id: 'm2', section: 'morning', periodNumber: 2, name: '第2节', startTime: '08:55', endTime: '09:40' },
  { id: 'm3', section: 'morning', periodNumber: 3, name: '第3节', startTime: '10:05', endTime: '10:50' },
  { id: 'm4', section: 'morning', periodNumber: 4, name: '第4节', startTime: '11:00', endTime: '11:45' },
  { id: 'a1', section: 'afternoon', periodNumber: 5, name: '第5节', startTime: '14:00', endTime: '14:45' },
  { id: 'a2', section: 'afternoon', periodNumber: 6, name: '第6节', startTime: '14:55', endTime: '15:40' },
  { id: 'a3', section: 'afternoon', periodNumber: 7, name: '第7节', startTime: '16:00', endTime: '16:45' },
  { id: 'a4', section: 'afternoon', periodNumber: 8, name: '第8节', startTime: '16:55', endTime: '17:40' },
];

export const COURSE_COLOR_MAP: Record<string, string> = {
  '数学': 'blue',
  '高等数学': 'blue',
  '语文': 'rose',
  '英语': 'emerald',
  '物理': 'purple',
  '化学': 'cyan',
  '生物': 'teal',
  '历史': 'amber',
  '地理': 'emerald',
  '政治': 'orange',
  '思想政治': 'orange',
  '道法': 'orange',
  '道德与法治': 'orange',
  '体育': 'teal',
  '音乐': 'purple',
  '美术': 'rose',
  '信息技术': 'blue',
  '计算机': 'indigo',
  '班会': 'amber',
  '自习': 'indigo',
  '早读': 'amber',
  '晚自习': 'violet',
  '答疑': 'cyan',
  '备课': 'teal',
};

export const COMMON_SUBJECTS = [
  '数学', '语文', '英语', '物理', '化学', '生物',
  '历史', '地理', '政治', '体育', '美术', '音乐',
  '信息技术', '班会', '课后自习', '答疑辅导'
];

export const COMMON_CLASSES = [
  '高二（1）', '高二（2）', '高二（3）', '高二（4）', '高二（5）',
  '高二（6）', '高二（7）', '高二（8）', '高二（9）', '高二（10）',
  '高二（11）', '高二（12）', '高二（13）', '高二（14）', '高二（15）',
  '高二（16）', '高二（17）'
];

export const COMMON_CLASSES_WITH_BAN = [
  '高二（1）班', '高二（2）班', '高二（3）班', '高二（4）班', '高二（5）班',
  '高二（6）班', '高二（7）班', '高二（8）班', '高二（9）班', '高二（10）班',
  '高二（11）班', '高二（12）班', '高二（13）班', '高二（14）班', '高二（15）班',
  '高二（16）班', '高二（17）班'
];
