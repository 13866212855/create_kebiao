'use client';

import React from 'react';
import {
  TimetableConfig,
  CourseCell,
  DAYS_CONFIG,
  COLOR_PRESETS,
  Period,
  DayInfo,
  COURSE_COLOR_MAP,
} from '@/types/timetable';
import {
  Plus,
  Edit2,
  Trash2,
  Copy,
  Clock,
  MapPin,
  Users,
  Calendar,
  MoreHorizontal,
} from 'lucide-react';

interface TimetableGridProps {
  config: TimetableConfig;
  schedule: Record<string, CourseCell>;
  activeBrushSubject: string | null;
  onCellClick: (dayOfWeek: number, period: Period) => void;
  onCellClear: (dayOfWeek: number, periodId: string) => void;
  onQuickFillCell: (dayOfWeek: number, periodId: string, subject: string) => void;
  onOpenCopyDay: (dayOfWeek: number) => void;
  onClearDay: (dayOfWeek: number) => void;
}

export default function TimetableGrid({
  config,
  schedule,
  activeBrushSubject,
  onCellClick,
  onCellClear,
  onQuickFillCell,
  onOpenCopyDay,
  onClearDay,
}: TimetableGridProps) {
  const activeDays: DayInfo[] = config.includeWeekend
    ? DAYS_CONFIG
    : DAYS_CONFIG.filter((d) => d.dayOfWeek <= 5);

  const morningPeriods = config.periods.filter((p) => p.section === 'morning');
  const afternoonPeriods = config.periods.filter((p) => p.section === 'afternoon');
  const eveningPeriods = config.periods.filter((p) => p.section === 'evening');

  // Count lessons for a day
  const getDayCourseCount = (dayOfWeek: number) => {
    let count = 0;
    config.periods.forEach((p) => {
      if (schedule[`${dayOfWeek}_${p.id}`]?.courseName?.trim()) {
        count++;
      }
    });
    return count;
  };

  const getCellColorPreset = (cell?: CourseCell) => {
    if (!cell) return null;
    let colorKey = cell.color;
    if (!colorKey && cell.courseName) {
      colorKey = COURSE_COLOR_MAP[cell.courseName] || 'blue';
    }
    return COLOR_PRESETS.find((p) => p.id === colorKey) || COLOR_PRESETS[0];
  };

  const handleCellAction = (
    e: React.MouseEvent,
    dayOfWeek: number,
    period: Period,
    currentCell?: CourseCell
  ) => {
    e.stopPropagation();
    if (activeBrushSubject && (!currentCell || !currentCell.courseName)) {
      onQuickFillCell(dayOfWeek, period.id, activeBrushSubject);
    } else {
      onCellClick(dayOfWeek, period);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Table Container with horizontal scroll on small devices */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left select-none">
          {/* Table Header */}
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-700">
              {/* Period & Time header */}
              <th className="py-3 px-3 w-28 sm:w-32 border-r border-slate-200 text-center font-bold text-xs bg-slate-100/50">
                <div className="flex items-center justify-center gap-1.5 text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>节次 / 时间</span>
                </div>
              </th>

              {/* Day Headers */}
              {activeDays.map((day) => {
                const count = getDayCourseCount(day.dayOfWeek);
                return (
                  <th
                    key={day.dayOfWeek}
                    className="py-3 px-3 min-w-[150px] sm:min-w-[170px] border-r border-slate-200 last:border-r-0 group relative hover:bg-slate-100/60 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800">{day.label}</span>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            count > 0
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {count} 节
                        </span>
                      </div>

                      {/* Header quick actions */}
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                        <button
                          type="button"
                          onClick={() => onOpenCopyDay(day.dayOfWeek)}
                          className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title={`复制【${day.shortLabel}】整天排课到其他天`}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        {count > 0 && (
                          <button
                            type="button"
                            onClick={() => onClearDay(day.dayOfWeek)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title={`清空【${day.shortLabel}】当天所有课程`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {/* 1. Morning Periods */}
            {morningPeriods.map((period, idx) => (
              <tr
                key={period.id}
                className="border-b border-slate-200 hover:bg-slate-50/40 transition group/row"
              >
                {/* Period label */}
                <td className="py-2.5 px-3 border-r border-slate-200 bg-slate-50/60 text-center">
                  <div className="font-bold text-xs text-slate-800">{period.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                    {period.startTime} - {period.endTime}
                  </div>
                  {idx === 0 && (
                    <span className="inline-block mt-1 text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-200">
                      上午
                    </span>
                  )}
                </td>

                {/* Day Cells */}
                {activeDays.map((day) => {
                  const cellKey = `${day.dayOfWeek}_${period.id}`;
                  const cell = schedule[cellKey];
                  const hasCourse = Boolean(cell?.courseName?.trim());
                  const preset = getCellColorPreset(cell);

                  return (
                    <td
                      key={day.dayOfWeek}
                      onClick={(e) => handleCellAction(e, day.dayOfWeek, period, cell)}
                      className={`p-2 border-r border-slate-200 last:border-r-0 align-top transition cursor-pointer relative group/cell min-h-[92px] ${
                        hasCourse
                          ? `${preset?.bgClass} hover:ring-2 hover:ring-blue-400`
                          : 'hover:bg-blue-50/40 bg-white'
                      }`}
                    >
                      {hasCourse ? (
                        <div className="flex flex-col justify-between h-full min-h-[72px] rounded-xl p-2.5 transition">
                          {/* Course title & action buttons */}
                          <div className="flex items-start justify-between gap-1">
                            <span
                              className={`font-bold text-sm leading-tight ${
                                preset?.textClass || 'text-slate-900'
                              }`}
                            >
                              {cell.courseName}
                            </span>

                            {/* Quick action buttons on hover */}
                            <div className="opacity-0 group-hover/cell:opacity-100 flex items-center gap-1 transition-opacity">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onCellClick(day.dayOfWeek, period);
                                }}
                                className="p-1 rounded bg-white/80 hover:bg-white shadow-xs text-slate-600 hover:text-blue-600 transition"
                                title="编辑此格"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onCellClear(day.dayOfWeek, period.id);
                                }}
                                className="p-1 rounded bg-white/80 hover:bg-white shadow-xs text-slate-500 hover:text-rose-600 transition"
                                title="清空此格"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Class Name */}
                          {cell.className && (
                            <div className="text-xs font-semibold text-slate-700 flex items-center gap-1 mt-1">
                              <Users className="w-3 h-3 text-slate-500 shrink-0" />
                              <span className="truncate">{cell.className}</span>
                            </div>
                          )}

                          {/* Classroom & Frequency */}
                          <div className="flex items-center gap-1.5 flex-wrap mt-1 text-[11px] text-slate-500">
                            {cell.classroom && (
                              <span className="flex items-center gap-0.5 truncate bg-white/60 px-1.5 py-0.5 rounded border border-slate-200">
                                <MapPin className="w-2.5 h-2.5 text-slate-400" />
                                {cell.classroom}
                              </span>
                            )}
                            {cell.weeks && cell.weeks !== '每周' && (
                              <span className="text-[10px] px-1 py-0.2 rounded bg-amber-100 text-amber-800 font-medium">
                                {cell.weeks}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="h-full min-h-[72px] flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 hover:border-blue-400 group-hover/cell:bg-blue-50/50 transition p-2">
                          {activeBrushSubject ? (
                            <div className="text-center animate-pulse">
                              <span className="text-xs font-semibold text-blue-600 block">
                                + 填入 {activeBrushSubject}
                              </span>
                              <span className="text-[10px] text-slate-400">点击立即填充</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1 text-slate-300 group-hover/cell:text-blue-600 transition">
                              <Plus className="w-4 h-4" />
                              <span className="text-[11px] font-medium hidden group-hover/cell:inline-block">
                                排课
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* 2. Lunch Break Divider Row */}
            <tr className="bg-slate-100/70 border-b border-slate-200">
              <td
                colSpan={1 + activeDays.length}
                className="py-2 text-center text-xs text-slate-500 font-medium tracking-wide"
              >
                🍱 午休 / 阳光就餐与休整（11:45 ~ 14:00）
              </td>
            </tr>

            {/* 3. Afternoon Periods */}
            {afternoonPeriods.map((period, idx) => (
              <tr
                key={period.id}
                className="border-b border-slate-200 hover:bg-slate-50/40 transition group/row"
              >
                {/* Period label */}
                <td className="py-2.5 px-3 border-r border-slate-200 bg-slate-50/60 text-center">
                  <div className="font-bold text-xs text-slate-800">{period.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                    {period.startTime} - {period.endTime}
                  </div>
                  {idx === 0 && (
                    <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                      下午
                    </span>
                  )}
                </td>

                {/* Day Cells */}
                {activeDays.map((day) => {
                  const cellKey = `${day.dayOfWeek}_${period.id}`;
                  const cell = schedule[cellKey];
                  const hasCourse = Boolean(cell?.courseName?.trim());
                  const preset = getCellColorPreset(cell);

                  return (
                    <td
                      key={day.dayOfWeek}
                      onClick={(e) => handleCellAction(e, day.dayOfWeek, period, cell)}
                      className={`p-2 border-r border-slate-200 last:border-r-0 align-top transition cursor-pointer relative group/cell min-h-[92px] ${
                        hasCourse
                          ? `${preset?.bgClass} hover:ring-2 hover:ring-blue-400`
                          : 'hover:bg-blue-50/40 bg-white'
                      }`}
                    >
                      {hasCourse ? (
                        <div className="flex flex-col justify-between h-full min-h-[72px] rounded-xl p-2.5 transition">
                          {/* Course title & action buttons */}
                          <div className="flex items-start justify-between gap-1">
                            <span
                              className={`font-bold text-sm leading-tight ${
                                preset?.textClass || 'text-slate-900'
                              }`}
                            >
                              {cell.courseName}
                            </span>

                            {/* Quick action buttons on hover */}
                            <div className="opacity-0 group-hover/cell:opacity-100 flex items-center gap-1 transition-opacity">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onCellClick(day.dayOfWeek, period);
                                }}
                                className="p-1 rounded bg-white/80 hover:bg-white shadow-xs text-slate-600 hover:text-blue-600 transition"
                                title="编辑此格"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onCellClear(day.dayOfWeek, period.id);
                                }}
                                className="p-1 rounded bg-white/80 hover:bg-white shadow-xs text-slate-500 hover:text-rose-600 transition"
                                title="清空此格"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Class Name */}
                          {cell.className && (
                            <div className="text-xs font-semibold text-slate-700 flex items-center gap-1 mt-1">
                              <Users className="w-3 h-3 text-slate-500 shrink-0" />
                              <span className="truncate">{cell.className}</span>
                            </div>
                          )}

                          {/* Classroom & Frequency */}
                          <div className="flex items-center gap-1.5 flex-wrap mt-1 text-[11px] text-slate-500">
                            {cell.classroom && (
                              <span className="flex items-center gap-0.5 truncate bg-white/60 px-1.5 py-0.5 rounded border border-slate-200">
                                <MapPin className="w-2.5 h-2.5 text-slate-400" />
                                {cell.classroom}
                              </span>
                            )}
                            {cell.weeks && cell.weeks !== '每周' && (
                              <span className="text-[10px] px-1 py-0.2 rounded bg-amber-100 text-amber-800 font-medium">
                                {cell.weeks}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="h-full min-h-[72px] flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 hover:border-blue-400 group-hover/cell:bg-blue-50/50 transition p-2">
                          {activeBrushSubject ? (
                            <div className="text-center animate-pulse">
                              <span className="text-xs font-semibold text-blue-600 block">
                                + 填入 {activeBrushSubject}
                              </span>
                              <span className="text-[10px] text-slate-400">点击立即填充</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1 text-slate-300 group-hover/cell:text-blue-600 transition">
                              <Plus className="w-4 h-4" />
                              <span className="text-[11px] font-medium hidden group-hover/cell:inline-block">
                                排课
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* 4. Evening Periods if any */}
            {eveningPeriods.length > 0 && (
              <>
                <tr className="bg-slate-100/70 border-b border-slate-200">
                  <td
                    colSpan={1 + activeDays.length}
                    className="py-1.5 text-center text-xs text-slate-500 font-medium"
                  >
                    🌙 晚自习 / 课后托管服务
                  </td>
                </tr>
                {eveningPeriods.map((period, idx) => (
                  <tr
                    key={period.id}
                    className="border-b border-slate-200 hover:bg-slate-50/40 transition group/row"
                  >
                    <td className="py-2.5 px-3 border-r border-slate-200 bg-slate-50/60 text-center">
                      <div className="font-bold text-xs text-slate-800">{period.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                        {period.startTime} - {period.endTime}
                      </div>
                    </td>

                    {activeDays.map((day) => {
                      const cellKey = `${day.dayOfWeek}_${period.id}`;
                      const cell = schedule[cellKey];
                      const hasCourse = Boolean(cell?.courseName?.trim());
                      const preset = getCellColorPreset(cell);

                      return (
                        <td
                          key={day.dayOfWeek}
                          onClick={(e) => handleCellAction(e, day.dayOfWeek, period, cell)}
                          className={`p-2 border-r border-slate-200 last:border-r-0 align-top transition cursor-pointer relative group/cell min-h-[85px] ${
                            hasCourse
                              ? `${preset?.bgClass} hover:ring-2 hover:ring-blue-400`
                              : 'hover:bg-blue-50/40 bg-white'
                          }`}
                        >
                          {hasCourse ? (
                            <div className="flex flex-col justify-between h-full min-h-[65px] rounded-xl p-2 transition">
                              <div className="flex items-start justify-between gap-1">
                                <span className={`font-bold text-xs ${preset?.textClass || 'text-slate-900'}`}>
                                  {cell.courseName}
                                </span>
                                <div className="opacity-0 group-hover/cell:opacity-100 flex items-center gap-1 transition-opacity">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onCellClick(day.dayOfWeek, period);
                                    }}
                                    className="p-1 rounded bg-white/80 hover:bg-white text-slate-600 transition"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onCellClear(day.dayOfWeek, period.id);
                                    }}
                                    className="p-1 rounded bg-white/80 hover:bg-white text-slate-500 hover:text-rose-600 transition"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              {cell.className && (
                                <div className="text-xs text-slate-700">{cell.className}</div>
                              )}
                            </div>
                          ) : (
                            <div className="h-full min-h-[65px] flex items-center justify-center rounded-xl border border-dashed border-slate-200 hover:border-blue-400 transition">
                              <Plus className="w-4 h-4 text-slate-300 group-hover/cell:text-blue-500" />
                            </div>
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
    </div>
  );
}
