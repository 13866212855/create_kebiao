'use client';

import React from 'react';
import { CourseCell, TimetableConfig, DAYS_CONFIG, COLOR_PRESETS, COURSE_COLOR_MAP } from '@/types/timetable';
import { BookOpen, Users, BarChart3, Flame, Clock } from 'lucide-react';

interface CourseStatsCardProps {
  config: TimetableConfig;
  schedule: Record<string, CourseCell>;
}

export default function CourseStatsCard({ config, schedule }: CourseStatsCardProps) {
  // Aggregate stats
  const activeDays = config.includeWeekend ? DAYS_CONFIG : DAYS_CONFIG.filter((d) => d.dayOfWeek <= 5);

  const subjectCountMap: Record<string, number> = {};
  const classCountMap: Record<string, number> = {};
  const dayCountMap: Record<number, number> = {};
  let totalLessons = 0;

  activeDays.forEach((d) => {
    dayCountMap[d.dayOfWeek] = 0;
  });

  Object.entries(schedule).forEach(([k, cell]) => {
    if (cell?.courseName?.trim()) {
      totalLessons++;

      // Subject
      const sub = cell.courseName.trim();
      subjectCountMap[sub] = (subjectCountMap[sub] || 0) + 1;

      // Class
      if (cell.className?.trim()) {
        const cls = cell.className.trim();
        classCountMap[cls] = (classCountMap[cls] || 0) + 1;
      }

      // Day
      const [dayStr] = k.split('_');
      const dayNum = parseInt(dayStr, 10);
      if (dayCountMap[dayNum] !== undefined) {
        dayCountMap[dayNum] = (dayCountMap[dayNum] || 0) + 1;
      }
    }
  });

  // Find peak day
  let peakDayName = '无';
  let peakDayLessons = 0;
  Object.entries(dayCountMap).forEach(([dayNumStr, count]) => {
    if (count > peakDayLessons) {
      peakDayLessons = count;
      const d = activeDays.find((item) => item.dayOfWeek === parseInt(dayNumStr, 10));
      if (d) peakDayName = d.label;
    }
  });

  const uniqueClassesCount = Object.keys(classCountMap).length;
  const uniqueSubjectsCount = Object.keys(subjectCountMap).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Lessons */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs text-slate-500 font-medium block">本周总课时</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-black text-slate-800 tracking-tight">{totalLessons}</span>
            <span className="text-xs font-semibold text-slate-500">节 / 周</span>
          </div>
        </div>
      </div>

      {/* 2. Classes Taught */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs text-slate-500 font-medium block">授课班级数</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-black text-slate-800 tracking-tight">{uniqueClassesCount}</span>
            <span className="text-xs font-semibold text-slate-500">个教学班</span>
          </div>
        </div>
      </div>

      {/* 3. Subjects Taught */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
          <BarChart3 className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs text-slate-500 font-medium block">教学科目</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-black text-slate-800 tracking-tight">{uniqueSubjectsCount}</span>
            <span className="text-xs font-semibold text-slate-500">门不同课程</span>
          </div>
        </div>
      </div>

      {/* 4. Peak Day */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
          <Flame className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs text-slate-500 font-medium block">排课最高峰日</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-bold text-slate-800">{peakDayName}</span>
            {peakDayLessons > 0 && (
              <span className="text-xs font-semibold text-amber-600">({peakDayLessons}节)</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
