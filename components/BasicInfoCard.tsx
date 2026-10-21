'use client';

import React, { useState } from 'react';
import { TimetableConfig } from '@/types/timetable';
import {
  User,
  Calendar,
  School,
  GraduationCap,
  FileText,
  Clock,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface BasicInfoCardProps {
  config: TimetableConfig;
  onChange: (updated: Partial<TimetableConfig>) => void;
  onOpenPeriodSettings: () => void;
}

export default function BasicInfoCard({
  config,
  onChange,
  onOpenPeriodSettings,
}: BasicInfoCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const academicYearOptions = [
    '2024-2025学年 第一学期',
    '2024-2025学年 第二学期',
    '2025-2026学年 第一学期',
    '2025-2026学年 第二学期',
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
            教师与课程表基本信息
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            教师姓名将用于导出的 Excel 文件命名（如：{config.teacherName || '教师姓名'}_周课程表_日期.xlsx）与表头展示
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Include weekend toggle */}
          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 transition">
            <input
              type="checkbox"
              checked={config.includeWeekend}
              onChange={(e) => onChange({ includeWeekend: e.target.checked })}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span>包含周末排课（周六/日）</span>
          </label>

          {/* Period setting button */}
          <button
            type="button"
            onClick={onOpenPeriodSettings}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200 transition"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>调整节次与时间</span>
          </button>
        </div>
      </div>

      {/* Primary Row: Teacher Name & Academic Year */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
        {/* Teacher Name */}
        <div className="lg:col-span-1">
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-blue-600" />
            教师姓名 <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={config.teacherName}
              onChange={(e) => onChange({ teacherName: e.target.value })}
              placeholder="请输入您的姓名 (如：张建国)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-blue-200 bg-blue-50/30 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-semibold text-slate-800 transition"
            />
          </div>
        </div>

        {/* Academic Year */}
        <div className="lg:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            学年与学期
          </label>
          <div className="space-y-1.5">
            <input
              type="text"
              value={config.academicYear}
              onChange={(e) => onChange({ academicYear: e.target.value })}
              placeholder="例如：2024-2025学年 第一学期"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm transition"
            />
            {/* Quick semester chips */}
            <div className="flex flex-wrap gap-1.5">
              {academicYearOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onChange({ academicYear: opt })}
                  className={`text-[11px] px-2 py-0.5 rounded-md border transition ${
                    config.academicYear === opt
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-medium'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Toggle more fields */}
        <div className="lg:col-span-1 flex flex-col justify-between">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <School className="w-3.5 h-3.5 text-emerald-600" />
              学校 / 单位 (选填)
            </label>
            <input
              type="text"
              value={config.schoolName}
              onChange={(e) => onChange({ schoolName: e.target.value })}
              placeholder="如：实验中学、育才小学"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm transition"
            />
          </div>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 mt-2 self-end"
          >
            <span>{isExpanded ? '收起更多表头设置' : '展开学科组与备注设置'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Fields */}
      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100 animate-in fade-in duration-150">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
              教研组 / 授课年级 (选填)
            </label>
            <input
              type="text"
              value={config.gradeSubject}
              onChange={(e) => onChange({ gradeSubject: e.target.value })}
              placeholder="如：高中数学教研组、高一年级组"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              表格底部备注说明 (选填)
            </label>
            <input
              type="text"
              value={config.remarks}
              onChange={(e) => onChange({ remarks: e.target.value })}
              placeholder="如：每周总课时14节 | 答疑时间：周二周四课后"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm transition"
            />
          </div>
        </div>
      )}
    </div>
  );
}
