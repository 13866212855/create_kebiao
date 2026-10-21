'use client';

import React, { useState, useEffect } from 'react';
import {
  CourseCell,
  COLOR_PRESETS,
  COMMON_SUBJECTS,
  COMMON_CLASSES,
  DAYS_CONFIG,
  Period,
  LastUsedCourseConfig,
} from '@/types/timetable';
import { X, Trash2, Check, BookOpen, Users, MapPin, Calendar, Palette, Sparkles, RotateCcw } from 'lucide-react';

interface CellEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayOfWeek: number;
  period: Period | null;
  initialData?: CourseCell;
  lastUsedCourse?: LastUsedCourseConfig | null;
  onSave: (data: CourseCell) => void;
  onClear: () => void;
}

export default function CellEditModal({
  isOpen,
  onClose,
  dayOfWeek,
  period,
  initialData,
  lastUsedCourse,
  onSave,
  onClear,
}: CellEditModalProps) {
  // If editing an existing cell with content, preserve its current data.
  // If adding a new course to an empty cell, default to the last entered subject/classroom configuration!
  const isNewCell = !initialData?.courseName;
  const [courseName, setCourseName] = useState(
    initialData?.courseName || (isNewCell ? lastUsedCourse?.courseName || '' : '')
  );
  const [className, setClassName] = useState(initialData?.className || '');
  const [classroom, setClassroom] = useState(
    initialData?.classroom !== undefined
      ? initialData.classroom
      : isNewCell
      ? lastUsedCourse?.classroom || ''
      : ''
  );
  const [weeks, setWeeks] = useState(
    initialData?.weeks || (isNewCell ? lastUsedCourse?.weeks || '每周' : '每周')
  );
  const [color, setColor] = useState(
    initialData?.color || (isNewCell ? lastUsedCourse?.color || 'blue' : 'blue')
  );
  const [teacherNote, setTeacherNote] = useState(initialData?.teacherNote || '');

  const dayInfo = DAYS_CONFIG.find((d) => d.dayOfWeek === dayOfWeek);

  if (!isOpen || !period) return null;

  const handleSelectPresetSubject = (sub: string) => {
    setCourseName(sub);
    // Auto color recommendation
    if (sub.includes('数')) setColor('blue');
    else if (sub.includes('语')) setColor('rose');
    else if (sub.includes('英')) setColor('emerald');
    else if (sub.includes('物') || sub.includes('化')) setColor('purple');
    else if (sub.includes('生') || sub.includes('地')) setColor('teal');
    else if (sub.includes('政') || sub.includes('史')) setColor('amber');
    else if (sub.includes('体') || sub.includes('自')) setColor('indigo');
    else if (sub.includes('班') || sub.includes('早')) setColor('amber');
    else if (sub.includes('答') || sub.includes('辅')) setColor('cyan');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim()) {
      onClear();
      onClose();
      return;
    }

    onSave({
      courseName: courseName.trim(),
      className: className.trim(),
      classroom: classroom.trim(),
      weeks,
      color,
      teacherNote: teacherNote.trim(),
    });
    onClose();
  };

  const handleClear = () => {
    onClear();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white">
                {dayInfo?.label || `周${dayOfWeek}`}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white">
                {period.name} ({period.startTime} - {period.endTime})
              </span>
            </div>
            <h3 className="text-lg font-bold mt-1 text-white">
              {initialData?.courseName ? '编辑课程格' : '添加课程排课'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/15 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Auto-filled from last configuration Notice */}
          {isNewCell && lastUsedCourse?.courseName && courseName === lastUsedCourse.courseName && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs text-blue-900 shadow-2xs animate-in fade-in duration-150">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  已自动默认选择上次学科：<strong>【{lastUsedCourse.courseName}】</strong>
                  {lastUsedCourse.classroom && (
                    <span className="text-blue-700 ml-1">（教室：{lastUsedCourse.classroom}）</span>
                  )}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCourseName('');
                  setClassroom('');
                  setColor('blue');
                }}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline underline-offset-2 ml-2 shrink-0 flex items-center gap-1"
                title="清空当前预选，换选其它学科"
              >
                <RotateCcw className="w-3 h-3" />
                清空换科
              </button>
            </div>
          )}

          {/* Course Name */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                课程名称 <span className="text-rose-500">*</span>
              </label>
              {lastUsedCourse?.courseName && courseName !== lastUsedCourse.courseName && (
                <button
                  type="button"
                  onClick={() => {
                    setCourseName(lastUsedCourse.courseName);
                    if (lastUsedCourse.color) setColor(lastUsedCourse.color);
                    if (lastUsedCourse.classroom) setClassroom(lastUsedCourse.classroom);
                  }}
                  className="text-[11px] text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-blue-500" />
                  恢复上次【{lastUsedCourse.courseName}】
                </button>
              )}
            </div>
            <input
              type="text"
              required
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="例如：数学、语文、高中物理、早读"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition"
              autoFocus
            />
            {/* Quick Subjects */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {COMMON_SUBJECTS.map((sub) => {
                const isLastUsed = lastUsedCourse?.courseName === sub;
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => handleSelectPresetSubject(sub)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                      courseName === sub
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs font-semibold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {sub}
                    {isLastUsed && courseName !== sub && (
                      <span className="ml-1 text-[10px] text-blue-500 font-normal">上次</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Class Name */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                授课班级 / 年级
              </label>
              {lastUsedCourse?.className && (
                <button
                  type="button"
                  onClick={() => setClassName(lastUsedCourse.className!)}
                  className={`text-[11px] px-2 py-0.5 rounded-md border font-medium transition flex items-center gap-1 ${
                    className === lastUsedCourse.className
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                  }`}
                  title="一键填入上次排课所用班级"
                >
                  <span>⚡ 沿用上次：{lastUsedCourse.className}</span>
                </button>
              )}
            </div>
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="例如：高二（1）、高二（2）"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition"
            />
            {/* Quick Classes: 17 classes of Senior 2 */}
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>快速选择高二年级班级（共17个班）：</span>
                <span className="text-[10px] text-indigo-500 font-medium">点击即可快速填入</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-50/60 rounded-xl border border-slate-100">
                {COMMON_CLASSES.map((cls) => {
                  const isSelected = className === cls || className === `${cls}班`;
                  return (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setClassName(cls)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition font-medium ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-900'
                      }`}
                    >
                      {cls}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Classroom & Frequency Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                教室 / 地点 (选填)
              </label>
              <input
                type="text"
                value={classroom}
                onChange={(e) => setClassroom(e.target.value)}
                placeholder="例如：302教室、实验室"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                上课周次
              </label>
              <select
                value={weeks}
                onChange={(e) => setWeeks(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm transition"
              >
                <option value="每周">每周</option>
                <option value="单周">单周 (奇数周)</option>
                <option value="双周">双周 (偶数周)</option>
                <option value="1-8周">前八周 (1-8周)</option>
                <option value="9-16周">后八周 (9-16周)</option>
              </select>
            </div>
          </div>

          {/* Color Tag */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-purple-600" />
              格子高亮颜色 (用于在课表和Excel中区分展示)
            </label>
            <div className="grid grid-cols-5 gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setColor(preset.id)}
                  className={`flex items-center gap-1.5 p-2 rounded-xl border transition text-left ${preset.bgClass} ${
                    color === preset.id
                      ? 'ring-2 ring-blue-600 ring-offset-1 border-blue-400 font-semibold'
                      : 'border-slate-200 opacity-80 hover:opacity-100'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: preset.hex }}
                  />
                  <span className="text-xs truncate">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              个人备忘 (选填)
            </label>
            <input
              type="text"
              value={teacherNote}
              onChange={(e) => setTeacherNote(e.target.value)}
              placeholder="例如：准备期中复习讲义、带实验器材"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs transition"
            />
          </div>

          {/* Actions Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            {initialData?.courseName ? (
              <button
                type="button"
                onClick={handleClear}
                className="px-3.5 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                清空此格
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm hover:shadow transition flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                保存排课
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
