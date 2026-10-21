'use client';

import React from 'react';
import { COMMON_SUBJECTS, COLOR_PRESETS, COURSE_COLOR_MAP } from '@/types/timetable';
import { Paintbrush, X, Trash2 } from 'lucide-react';

interface QuickSubjectBarProps {
  activeBrushSubject: string | null;
  scheduledSubjectCounts?: Record<string, number>;
  lastUsedSubject?: string;
  onSelectBrush: (subject: string | null) => void;
  onClearSubject?: (subject: string) => void;
  onOpenClearModal?: () => void;
}

export default function QuickSubjectBar({
  activeBrushSubject,
  scheduledSubjectCounts = {},
  lastUsedSubject,
  onSelectBrush,
  onClearSubject,
  onOpenClearModal,
}: QuickSubjectBarProps) {
  const getSubjectColorStyle = (sub: string) => {
    const colorId = COURSE_COLOR_MAP[sub] || 'blue';
    const preset = COLOR_PRESETS.find((p) => p.id === colorId) || COLOR_PRESETS[0];
    return preset;
  };

  const hasAnyScheduled = Object.values(scheduledSubjectCounts).some((c) => c > 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="flex items-center gap-2 shrink-0">
        <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
          <Paintbrush className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800">常用科目快速排课 / 清空</span>
            {hasAnyScheduled && onOpenClearModal && (
              <button
                type="button"
                onClick={onOpenClearModal}
                className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-md border border-rose-200 transition flex items-center gap-1"
                title="打开清空与重置排课管理弹窗"
              >
                <Trash2 className="w-3 h-3" />
                <span>批量清空科目...</span>
              </button>
            )}
          </div>
          <span className="text-[11px] text-slate-400">
            {activeBrushSubject
              ? `已激活刷子 [${activeBrushSubject}]：点击任意空白格子即可一键填入`
              : lastUsedSubject
              ? `已自动记忆上次学科【${lastUsedSubject}】· 点击任意空白格子将默认选择此学科`
              : '点击科目激活连点刷课；右上角角标为当前已排节数'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {activeBrushSubject && (
          <button
            type="button"
            onClick={() => onSelectBrush(null)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition mr-1"
          >
            <X className="w-3.5 h-3.5" />
            退出刷课模式
          </button>
        )}

        {COMMON_SUBJECTS.map((sub) => {
          const colorPreset = getSubjectColorStyle(sub);
          const isCurrentBrush = activeBrushSubject === sub;
          const count = scheduledSubjectCounts[sub] || 0;

          return (
            <div key={sub} className="relative group/sub">
              <button
                type="button"
                onClick={() => onSelectBrush(isCurrentBrush ? null : sub)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                  isCurrentBrush
                    ? 'ring-2 ring-blue-600 bg-blue-600 text-white border-blue-600 shadow-xs'
                    : `${colorPreset.bgClass} ${colorPreset.textClass} ${colorPreset.borderClass}`
                }`}
                title={`点击激活 [${sub}] 连续填课刷（当前已排 ${count} 节）`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: colorPreset.hex }}
                />
                <span>{sub}</span>
                {lastUsedSubject === sub && !isCurrentBrush && (
                  <span className="text-[10px] px-1 py-0.2 rounded-full bg-blue-100 text-blue-800 font-bold">
                    上次
                  </span>
                )}
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1 rounded-full font-bold ${
                      isCurrentBrush
                        ? 'bg-white/20 text-white'
                        : 'bg-black/10 text-slate-700'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>

              {/* Quick clear button on hover if subject has lessons */}
              {count > 0 && onClearSubject && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearSubject(sub);
                  }}
                  className="absolute -top-1.5 -right-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-0.5 opacity-0 group-hover/sub:opacity-100 transition shadow-xs z-10"
                  title={`清空全周所有【${sub}】排课 (${count}节)`}
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
