'use client';

import React from 'react';
import {
  TimetableConfig,
  CourseCell,
  DAYS_CONFIG,
  COLOR_PRESETS,
  DayInfo,
} from '@/types/timetable';
import { X, Download, Printer, FileSpreadsheet } from 'lucide-react';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: TimetableConfig;
  schedule: Record<string, CourseCell>;
  onExportExcel: () => void;
}

export default function PreviewModal({
  isOpen,
  onClose,
  config,
  schedule,
  onExportExcel,
}: PreviewModalProps) {
  if (!isOpen) return null;

  const activeDays: DayInfo[] = config.includeWeekend
    ? DAYS_CONFIG
    : DAYS_CONFIG.filter((d) => d.dayOfWeek <= 5);

  const morningPeriods = config.periods.filter((p) => p.section === 'morning');
  const afternoonPeriods = config.periods.filter((p) => p.section === 'afternoon');
  const eveningPeriods = config.periods.filter((p) => p.section === 'evening');

  let totalLessons = 0;
  Object.values(schedule).forEach((c) => {
    if (c?.courseName?.trim()) totalLessons++;
  });

  const now = new Date();
  const dateStr = `${now.getFullYear()}年${String(now.getMonth() + 1).padStart(2, '0')}月${String(
    now.getDate()
  ).padStart(2, '0')}日`;

  const handlePrint = () => {
    window.print();
  };

  const getColorClasses = (colorKey?: string) => {
    const preset = COLOR_PRESETS.find((p) => p.id === colorKey) || COLOR_PRESETS[0];
    return preset;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">课程表预览</h3>
              <p className="text-xs text-slate-400">
                样式已高保真匹配导出的 Excel 及打印版式（共 {totalLessons} 节课）
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              打印 / 存为PDF
            </button>
            <button
              type="button"
              onClick={onExportExcel}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              导出 Excel (.xlsx)
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview Printable Document Area */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-slate-100 flex justify-center">
          <div className="bg-white w-full max-w-4xl p-6 sm:p-8 rounded-xl shadow-md border border-slate-300 print:shadow-none print:border-none print:p-0">
            {/* Title */}
            <div className="text-center pb-4 border-b-2 border-blue-900 mb-4">
              <h1 className="text-2xl font-bold tracking-wide text-slate-900">
                {config.schoolName ? `${config.schoolName} ` : ''}
                {config.academicYear ? `${config.academicYear} ` : ''}
                教师个人周课程表
              </h1>
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 mt-2.5 px-2">
                <span>
                  <strong>任课教师：</strong>
                  {config.teacherName || '未命名'}
                </span>
                {config.gradeSubject && (
                  <span>
                    <strong>学科/年级：</strong>
                    {config.gradeSubject}
                  </span>
                )}
                <span>
                  <strong>制表日期：</strong>
                  {dateStr}
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-slate-300 rounded-lg">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <th className="py-2 px-2 border-r border-slate-300 w-12 text-center">时段</th>
                    <th className="py-2 px-2 border-r border-slate-300 w-14 text-center">节次</th>
                    <th className="py-2 px-2 border-r border-slate-300 w-24 text-center">作息时间</th>
                    {activeDays.map((d) => (
                      <th
                        key={d.dayOfWeek}
                        className="py-2 px-3 border-r border-slate-300 last:border-r-0 text-center font-bold"
                      >
                        {d.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Morning Section */}
                  {morningPeriods.map((period, pIdx) => (
                    <tr key={period.id} className="border-b border-slate-200">
                      {pIdx === 0 && (
                        <td
                          rowSpan={morningPeriods.length}
                          className="border-r border-slate-300 bg-slate-50 text-center font-bold text-slate-700 py-3"
                        >
                          上<br />午
                        </td>
                      )}
                      <td className="border-r border-slate-300 bg-slate-50 text-center font-semibold text-slate-700 py-2">
                        {period.name}
                      </td>
                      <td className="border-r border-slate-300 text-center text-slate-500 py-2">
                        {period.startTime} - {period.endTime}
                      </td>
                      {activeDays.map((day) => {
                        const cellKey = `${day.dayOfWeek}_${period.id}`;
                        const course = schedule[cellKey];
                        const preset = course ? getColorClasses(course.color) : null;

                        return (
                          <td
                            key={day.dayOfWeek}
                            className={`border-r border-slate-200 last:border-r-0 p-2 text-center align-middle ${
                              preset ? preset.bgClass : ''
                            }`}
                          >
                            {course && course.courseName ? (
                              <div className="space-y-0.5">
                                <div className={`font-bold text-sm ${preset?.textClass}`}>
                                  {course.courseName}
                                </div>
                                {course.className && (
                                  <div className="text-slate-700 font-medium">
                                    {course.className}
                                  </div>
                                )}
                                {course.classroom && (
                                  <div className="text-slate-500 text-[11px]">
                                    [{course.classroom}]
                                  </div>
                                )}
                                {course.weeks && course.weeks !== '每周' && (
                                  <span className="inline-block text-[10px] px-1 bg-white/80 rounded border border-slate-300 text-slate-600">
                                    {course.weeks}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-300 text-[11px]">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  {/* Lunch Break */}
                  <tr className="bg-slate-50 border-b border-slate-300">
                    <td
                      colSpan={3 + activeDays.length}
                      className="py-1.5 text-center text-[11px] text-slate-500 italic"
                    >
                      — 午休 / 阳光就餐与休整 (11:45 ~ 14:00) —
                    </td>
                  </tr>

                  {/* Afternoon Section */}
                  {afternoonPeriods.map((period, pIdx) => (
                    <tr key={period.id} className="border-b border-slate-200">
                      {pIdx === 0 && (
                        <td
                          rowSpan={afternoonPeriods.length}
                          className="border-r border-slate-300 bg-slate-50 text-center font-bold text-slate-700 py-3"
                        >
                          下<br />午
                        </td>
                      )}
                      <td className="border-r border-slate-300 bg-slate-50 text-center font-semibold text-slate-700 py-2">
                        {period.name}
                      </td>
                      <td className="border-r border-slate-300 text-center text-slate-500 py-2">
                        {period.startTime} - {period.endTime}
                      </td>
                      {activeDays.map((day) => {
                        const cellKey = `${day.dayOfWeek}_${period.id}`;
                        const course = schedule[cellKey];
                        const preset = course ? getColorClasses(course.color) : null;

                        return (
                          <td
                            key={day.dayOfWeek}
                            className={`border-r border-slate-200 last:border-r-0 p-2 text-center align-middle ${
                              preset ? preset.bgClass : ''
                            }`}
                          >
                            {course && course.courseName ? (
                              <div className="space-y-0.5">
                                <div className={`font-bold text-sm ${preset?.textClass}`}>
                                  {course.courseName}
                                </div>
                                {course.className && (
                                  <div className="text-slate-700 font-medium">
                                    {course.className}
                                  </div>
                                )}
                                {course.classroom && (
                                  <div className="text-slate-500 text-[11px]">
                                    [{course.classroom}]
                                  </div>
                                )}
                                {course.weeks && course.weeks !== '每周' && (
                                  <span className="inline-block text-[10px] px-1 bg-white/80 rounded border border-slate-300 text-slate-600">
                                    {course.weeks}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-300 text-[11px]">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  {/* Evening Section if any */}
                  {eveningPeriods.length > 0 && (
                    <>
                      <tr className="bg-slate-50 border-b border-slate-300">
                        <td
                          colSpan={3 + activeDays.length}
                          className="py-1.5 text-center text-[11px] text-slate-500 italic"
                        >
                          — 晚自习 / 课后延时服务 —
                        </td>
                      </tr>
                      {eveningPeriods.map((period, pIdx) => (
                        <tr key={period.id} className="border-b border-slate-200">
                          {pIdx === 0 && (
                            <td
                              rowSpan={eveningPeriods.length}
                              className="border-r border-slate-300 bg-slate-50 text-center font-bold text-slate-700 py-3"
                            >
                              晚<br />上
                            </td>
                          )}
                          <td className="border-r border-slate-300 bg-slate-50 text-center font-semibold text-slate-700 py-2">
                            {period.name}
                          </td>
                          <td className="border-r border-slate-300 text-center text-slate-500 py-2">
                            {period.startTime} - {period.endTime}
                          </td>
                          {activeDays.map((day) => {
                            const cellKey = `${day.dayOfWeek}_${period.id}`;
                            const course = schedule[cellKey];
                            const preset = course ? getColorClasses(course.color) : null;

                            return (
                              <td
                                key={day.dayOfWeek}
                                className={`border-r border-slate-200 last:border-r-0 p-2 text-center align-middle ${
                                  preset ? preset.bgClass : ''
                                }`}
                              >
                                {course && course.courseName ? (
                                  <div className="space-y-0.5">
                                    <div className={`font-bold text-sm ${preset?.textClass}`}>
                                      {course.courseName}
                                    </div>
                                    {course.className && (
                                      <div className="text-slate-700 font-medium">
                                        {course.className}
                                      </div>
                                    )}
                                    {course.classroom && (
                                      <div className="text-slate-500 text-[11px]">
                                        [{course.classroom}]
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-slate-300 text-[11px]">—</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Summary */}
            <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <strong>本周总课时：</strong>
                <span className="text-blue-700 font-bold text-sm ml-1">{totalLessons} 节</span>
              </div>
              <div className="text-slate-500 text-[11px]">
                {config.remarks || '说明：空白时段为教研、备课或课间休息时间。'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
