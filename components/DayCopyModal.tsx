'use client';

import React, { useState } from 'react';
import { DAYS_CONFIG, CourseCell, DayInfo } from '@/types/timetable';
import { Copy, X, Check, ArrowRight, AlertTriangle } from 'lucide-react';

interface DayCopyModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: Record<string, CourseCell>;
  includeWeekend: boolean;
  onCopyDay: (sourceDay: number, targetDays: number[], overwrite: boolean) => void;
  defaultSourceDay?: number;
}

export default function DayCopyModal({
  isOpen,
  onClose,
  schedule,
  includeWeekend,
  onCopyDay,
  defaultSourceDay = 1,
}: DayCopyModalProps) {
  const [sourceDay, setSourceDay] = useState<number>(defaultSourceDay);
  const [targetDays, setTargetDays] = useState<number[]>([]);
  const [overwrite, setOverwrite] = useState<boolean>(true);

  if (!isOpen) return null;

  const activeDays: DayInfo[] = includeWeekend
    ? DAYS_CONFIG
    : DAYS_CONFIG.filter((d) => d.dayOfWeek <= 5);

  // Count courses on source day
  const getCourseCountForDay = (day: number) => {
    let count = 0;
    Object.entries(schedule).forEach(([k, val]) => {
      if (k.startsWith(`${day}_`) && val?.courseName?.trim()) {
        count++;
      }
    });
    return count;
  };

  const handleToggleTarget = (dayNum: number) => {
    if (dayNum === sourceDay) return;
    setTargetDays((prev) =>
      prev.includes(dayNum) ? prev.filter((d) => d !== dayNum) : [...prev, dayNum]
    );
  };

  const handleSelectAllTargets = () => {
    const allExceptSource = activeDays
      .map((d) => d.dayOfWeek)
      .filter((d) => d !== sourceDay);
    if (targetDays.length === allExceptSource.length) {
      setTargetDays([]);
    } else {
      setTargetDays(allExceptSource);
    }
  };

  const handleExecuteCopy = () => {
    if (targetDays.length === 0) return;
    onCopyDay(sourceDay, targetDays, overwrite);
    onClose();
  };

  const sourceCoursesCount = getCourseCountForDay(sourceDay);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Copy className="w-5 h-5 text-indigo-200" />
            <h3 className="text-base font-bold text-white">快速复制某天课程</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/15 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* 1. Select Source Day */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              1. 选择来源日期（复制它的整日课表）：
            </label>
            <div className="grid grid-cols-5 gap-2">
              {activeDays.map((day) => {
                const count = getCourseCountForDay(day.dayOfWeek);
                const isSelected = sourceDay === day.dayOfWeek;
                return (
                  <button
                    key={day.dayOfWeek}
                    type="button"
                    onClick={() => {
                      setSourceDay(day.dayOfWeek);
                      setTargetDays((prev) => prev.filter((d) => d !== day.dayOfWeek));
                    }}
                    className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-300'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-xs font-bold">{day.shortLabel}</span>
                    <span
                      className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {count}节课
                    </span>
                  </button>
                );
              })}
            </div>
            {sourceCoursesCount === 0 && (
              <p className="mt-2 text-xs text-amber-600 flex items-center gap-1 bg-amber-50 p-2 rounded-lg border border-amber-200">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                所选来源日期暂无排课数据，复制后目标天对应时段也将为空白。
              </p>
            )}
          </div>

          {/* 2. Select Target Days */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                2. 复制到哪一天（可多选目标天）：
              </label>
              <button
                type="button"
                onClick={handleSelectAllTargets}
                className="text-xs text-blue-600 hover:underline"
              >
                {targetDays.length === activeDays.length - 1 ? '取消全选' : '全选其他天'}
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {activeDays.map((day) => {
                const isSource = sourceDay === day.dayOfWeek;
                const isTargetSelected = targetDays.includes(day.dayOfWeek);
                const targetCount = getCourseCountForDay(day.dayOfWeek);

                return (
                  <button
                    key={day.dayOfWeek}
                    type="button"
                    disabled={isSource}
                    onClick={() => handleToggleTarget(day.dayOfWeek)}
                    className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                      isSource
                        ? 'opacity-40 bg-slate-100 border-slate-200 cursor-not-allowed text-slate-400'
                        : isTargetSelected
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-900 ring-2 ring-indigo-400 font-semibold'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold">{day.shortLabel}</span>
                    <span className="text-[10px] text-slate-500">
                      {isSource ? '当前来源' : `${targetCount}节已有`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Overwrite Strategy */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <span className="text-xs font-semibold text-slate-700 block">冲突处理策略：</span>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
              <input
                type="radio"
                name="overwrite"
                checked={overwrite}
                onChange={() => setOverwrite(true)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span>覆盖目标天的全部课程（以来源天为准）</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
              <input
                type="radio"
                name="overwrite"
                checked={!overwrite}
                onChange={() => setOverwrite(false)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span>仅填充目标天空白时段（保留目标天已有课程）</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            已选 {targetDays.length} 个目标天
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition"
            >
              取消
            </button>
            <button
              type="button"
              disabled={targetDays.length === 0}
              onClick={handleExecuteCopy}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              立即复制
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
