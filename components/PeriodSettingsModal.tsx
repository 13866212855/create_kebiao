'use client';

import React, { useState } from 'react';
import { Period, SectionType, DEFAULT_PERIODS } from '@/types/timetable';
import { Clock, Plus, Trash2, X, Check, RotateCcw } from 'lucide-react';

interface PeriodSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  periods: Period[];
  onSave: (periods: Period[]) => void;
}

export default function PeriodSettingsModal({
  isOpen,
  onClose,
  periods: initialPeriods,
  onSave,
}: PeriodSettingsModalProps) {
  const [periods, setPeriods] = useState<Period[]>(initialPeriods);

  if (!isOpen) return null;

  const handleUpdate = (id: string, field: keyof Period, val: any) => {
    setPeriods((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: val } : p))
    );
  };

  const handleAddPeriod = (section: SectionType) => {
    const sectionPeriods = periods.filter((p) => p.section === section);
    const newIdx = sectionPeriods.length + 1;
    const prefix = section === 'morning' ? 'm' : section === 'afternoon' ? 'a' : 'e';
    const uniqueId = `${prefix}_${Date.now()}`;
    const namePrefix = section === 'evening' ? '晚自习' : '第';
    const name = section === 'evening' ? `晚自习${newIdx}` : `第${periods.length + 1}节`;

    const newPeriod: Period = {
      id: uniqueId,
      section,
      periodNumber: periods.length + 1,
      name,
      startTime: section === 'evening' ? '18:30' : '17:50',
      endTime: section === 'evening' ? '19:15' : '18:35',
    };

    setPeriods([...periods, newPeriod]);
  };

  const handleDelete = (id: string) => {
    if (periods.length <= 1) {
      return;
    }
    setPeriods((prev) => prev.filter((p) => p.id !== id));
  };

  const handleResetToDefault = () => {
    setPeriods(DEFAULT_PERIODS);
  };

  const handleSave = () => {
    onSave(periods);
    onClose();
  };

  const morningList = periods.filter((p) => p.section === 'morning');
  const afternoonList = periods.filter((p) => p.section === 'afternoon');
  const eveningList = periods.filter((p) => p.section === 'evening');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-200" />
            <div>
              <h3 className="text-base font-bold text-white">作息时间与节次设置</h3>
              <p className="text-xs text-blue-200 mt-0.5">自定义各节次名称、起始时间与时段划分</p>
            </div>
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
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Morning Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                🌅 上午时段（当前 {morningList.length} 节）
              </span>
              <button
                type="button"
                onClick={() => handleAddPeriod('morning')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                新增上午节次
              </button>
            </div>

            <div className="space-y-2">
              {morningList.map((p) => (
                <div key={p.id} className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <input
                    type="text"
                    value={p.name}
                    onChange={(e) => handleUpdate(p.id, 'name', e.target.value)}
                    className="w-28 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white"
                    placeholder="节次名称"
                  />
                  <div className="flex items-center gap-1 text-xs text-slate-600">
                    <input
                      type="time"
                      value={p.startTime}
                      onChange={(e) => handleUpdate(p.id, 'startTime', e.target.value)}
                      className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                    />
                    <span>至</span>
                    <input
                      type="time"
                      value={p.endTime}
                      onChange={(e) => handleUpdate(p.id, 'endTime', e.target.value)}
                      className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id)}
                    className="ml-auto p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                    title="删除该节次"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Afternoon Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                🌤️ 下午时段（当前 {afternoonList.length} 节）
              </span>
              <button
                type="button"
                onClick={() => handleAddPeriod('afternoon')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                新增下午节次
              </button>
            </div>

            <div className="space-y-2">
              {afternoonList.map((p) => (
                <div key={p.id} className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <input
                    type="text"
                    value={p.name}
                    onChange={(e) => handleUpdate(p.id, 'name', e.target.value)}
                    className="w-28 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white"
                    placeholder="节次名称"
                  />
                  <div className="flex items-center gap-1 text-xs text-slate-600">
                    <input
                      type="time"
                      value={p.startTime}
                      onChange={(e) => handleUpdate(p.id, 'startTime', e.target.value)}
                      className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                    />
                    <span>至</span>
                    <input
                      type="time"
                      value={p.endTime}
                      onChange={(e) => handleUpdate(p.id, 'endTime', e.target.value)}
                      className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id)}
                    className="ml-auto p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                    title="删除该节次"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Evening Section (Optional) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                🌙 晚自习 / 课后托管服务（可选）
              </span>
              <button
                type="button"
                onClick={() => handleAddPeriod('evening')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                新增晚自习节次
              </button>
            </div>

            {eveningList.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                暂未添加晚间节次。如果学校有晚自习或课后延时辅导，可点击上方按钮添加。
              </p>
            ) : (
              <div className="space-y-2">
                {eveningList.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100">
                    <input
                      type="text"
                      value={p.name}
                      onChange={(e) => handleUpdate(p.id, 'name', e.target.value)}
                      className="w-28 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white"
                      placeholder="节次名称"
                    />
                    <div className="flex items-center gap-1 text-xs text-slate-600">
                      <input
                        type="time"
                        value={p.startTime}
                        onChange={(e) => handleUpdate(p.id, 'startTime', e.target.value)}
                        className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                      />
                      <span>至</span>
                      <input
                        type="time"
                        value={p.endTime}
                        onChange={(e) => handleUpdate(p.id, 'endTime', e.target.value)}
                        className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
                      className="ml-auto p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                      title="删除该节次"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 hover:underline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            恢复默认8节作息
          </button>
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
              onClick={handleSave}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              应用节次设置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
