import { TimetableConfig, CourseCell, DEFAULT_PERIODS } from '@/types/timetable';

export const SAMPLE_CONFIG: TimetableConfig = {
  teacherName: '张建国',
  academicYear: '2024-2025学年 第一学期',
  schoolName: '光明高级中学',
  gradeSubject: '高二数学教研组',
  remarks: '每周总课时：14节 | 周三下午第3节组内公开课 | 答疑辅导：周二、周四课后',
  includeWeekend: false,
  periods: DEFAULT_PERIODS,
};

export const SAMPLE_SCHEDULE: Record<string, CourseCell> = {
  // Monday (1)
  '1_m1': { courseName: '早读/晨会', className: '高二（1）', classroom: '博学楼201', color: 'amber', weeks: '每周' },
  '1_m2': { courseName: '数学', className: '高二（1）', classroom: '博学楼201', color: 'blue', weeks: '每周' },
  '1_m4': { courseName: '数学', className: '高二（3）', classroom: '博学楼203', color: 'blue', weeks: '每周' },
  '1_a2': { courseName: '校本选修', className: '高二数学竞赛班', classroom: '微机教室2', color: 'purple', weeks: '每周' },
  '1_a4': { courseName: '课后答疑', className: '高二（1）', classroom: '教师办公室', color: 'cyan', weeks: '单周' },

  // Tuesday (2)
  '2_m1': { courseName: '数学', className: '高二（3）', classroom: '博学楼203', color: 'blue', weeks: '每周' },
  '2_m3': { courseName: '数学', className: '高二（1）', classroom: '博学楼201', color: 'blue', weeks: '每周' },
  '2_a1': { courseName: '教研备课', className: '高二备课组', classroom: '教研活动室', color: 'teal', weeks: '每周' },
  '2_a3': { courseName: '辅导答疑', className: '高二（3）', classroom: '博学楼203', color: 'cyan', weeks: '每周' },

  // Wednesday (3)
  '3_m2': { courseName: '数学', className: '高二（1）', classroom: '博学楼201', color: 'blue', weeks: '每周' },
  '3_m3': { courseName: '数学', className: '高二（3）', classroom: '博学楼203', color: 'blue', weeks: '每周' },
  '3_a3': { courseName: '组内公开课', className: '公开课视导', classroom: '阶梯多功能厅', color: 'rose', weeks: '单周' },
  '3_a4': { courseName: '班主任例会', className: '年级部组织', classroom: '综合行政楼301', color: 'amber', weeks: '双周' },

  // Thursday (4)
  '4_m1': { courseName: '数学', className: '高二（1）', classroom: '博学楼201', color: 'blue', weeks: '每周' },
  '4_m2': { courseName: '数学', className: '高二（3）', classroom: '博学楼203', color: 'blue', weeks: '每周' },
  '4_a2': { courseName: '社团指导', className: '数理逻辑社', classroom: '博学楼201', color: 'indigo', weeks: '每周' },

  // Friday (5)
  '5_m3': { courseName: '数学综合练', className: '高二（1）', classroom: '博学楼201', color: 'blue', weeks: '每周' },
  '5_m4': { courseName: '数学综合练', className: '高二（3）', classroom: '博学楼203', color: 'blue', weeks: '每周' },
  '5_a1': { courseName: '主题班会', className: '高二（1）', classroom: '博学楼201', color: 'amber', weeks: '每周' },
  '5_a3': { courseName: '课后总结', className: '高二备课组', classroom: '教师办公室', color: 'teal', weeks: '每周' },
};
