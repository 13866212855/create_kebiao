'use client';

import React, { useState } from 'react';
import { CourseCell, COLOR_PRESETS, COURSE_COLOR_MAP } from '@/types/timetable';
import {
  Trash2,
  X,
  AlertTriangle,
  BookOpen,
  Users,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';

interface ClearScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: Record<string, CourseCell>;
  onClearBySubjects: (subjects: string[]) => void;
  onClearByClasses: (classes: string[]) => void;
  onClearAll: () => void;
}

export default function ClearScheduleModal({
  isOpen,
  onClose,
  schedule,
  onClearBySubjects,
  onClearByClasses,
  onClearAll,
}: ClearScheduleModalProps) {
  const [activeTab, setActiveTab] = useState<'subject' | 'class' | 'all'>('subject');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [confirmClearAllStep, setConfirmClearAllStep] = useState(false);

  if (!isOpen) return null;

  // Aggregate current stats
  const subjectCountMap: Record<string, number> = {};
  const classCountMap: Record<string, number> = {};
  let totalLessons = 0;

  Object.values(schedule).forEach((cell) => {
    if (cell?.courseName?.trim()) {
      totalLessons++;
      const sub = cell.courseName.trim();
      subjectCountMap[sub] = (subjectCountMap[sub] || 0) + 1;

      if (cell.className?.trim()) {
        const cls = cell.className.trim();
        classCountMap[cls] = (classCountMap[cls] || 0) + 1;
      }
    }
  });

  const subjectsList = Object.entries(subjectCountMap);
  const classesList = Object.entries(classCountMap);

  const toggleSubject = (sub: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  const selectAllSubjects = () => {
    if (selectedSubjects.length === subjectsList.length) {
      setSelectedSubjects([]);
    } else {
      setSelectedSubjects(subjectsList.map(([s]) => s));
    }
  };

  const toggleClass = (cls: string) => {
    setSelectedClasses((prev) =>
      prev.includes(cls) ? prev.filter((c) => c !== cls) : [...prev, cls]
    );
  };

  const selectAllClasses = () => {
    if (selectedClasses.length === classesList.length) {
      setSelectedClasses([]);
    } else {
      setSelectedClasses(classesList.map(([c]) => c));
    }
  };

  const handleExecuteClearSubjects = () => {
    if (selectedSubjects.length === 0) return;
    onClearBySubjects(selectedSubjects);
    onClose();
  };

  const handleExecuteClearClasses = () => {
    if (selectedClasses.length === 0) return;
    onClearByClasses(selectedClasses);
    onClose();
  };

  const handleExecuteClearAll = () => {
    onClearAll();
    onClose();
  };

  const getSubjectColorPreset = (sub: string) => {
    const colorId = COURSE_COLOR_MAP[sub] || 'blue';
    return COLOR_PRESETS.find((p) => p.id === colorId) || COLOR_PRESETS[0];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 to-amber-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl">
              <Trash2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">清空与重置排课</h3>
              <p className="text-xs text-rose-100 mt-0.5">
                支持按指定科目、指定班级清空，或一键清空全周排课
              </p>
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

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('subject');
              setConfirmClearAllStep(false);
            }}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'subject'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>按科目清空 ({subjectsList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('class');
              setConfirmClearAllStep(false);
            }}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'class'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>按班级清空 ({classesList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('all');
              setConfirmClearAllStep(false);
            }}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>清空全周所有课程</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: CLEAR BY SUBJECT */}
          {activeTab === 'subject' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    选择要清空的科目：
                  </span>
                  <span className="text-[11px] text-slate-500">
                    勾选后将自动清空整张周课表中属于该科目的全部排课格子
                  </span>
                </div>
                {subjectsList.length > 0 && (
                  <button
                    type="button"
                    onClick={selectAllSubjects}
                    className="text-xs font-semibold text-rose-600 hover:underline"
                  >
                    {selectedSubjects.length === subjectsList.length ? '取消全选' : '全选科目'}
                  </button>
                )}
              </div>

              {subjectsList.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  当前课表暂无任何科目排课
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {subjectsList.map(([sub, count]) => {
                    const isSelected = selectedSubjects.includes(sub);
                    const preset = getSubjectColorPreset(sub);

                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => toggleSubject(sub)}
                        className={`p-3 rounded-xl border text-left transition flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-400 text-rose-950 font-bold shadow-xs'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: preset.hex }}
                          />
                          <span className="text-xs truncate">{sub}</span>
                        </div>
                        <span
                          className={`text-[11px] px-1.5 py-0.5 rounded-full shrink-0 font-mono ${
                            isSelected
                              ? 'bg-rose-200 text-rose-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {count}节
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CLEAR BY CLASS */}
          {activeTab === 'class' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    选择要清空的班级：
                  </span>
                  <span className="text-[11px] text-slate-500">
                    勾选后将自动清空整张周课表中分配给该班级的排课
                  </span>
                </div>
                {classesList.length > 0 && (
                  <button
                    type="button"
                    onClick={selectAllClasses}
                    className="text-xs font-semibold text-rose-600 hover:underline"
                  >
                    {selectedClasses.length === classesList.length ? '取消全选' : '全选班级'}
                  </button>
                )}
              </div>

              {classesList.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  当前课表暂未设置授课班级信息
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {classesList.map(([cls, count]) => {
                    const isSelected = selectedClasses.includes(cls);

                    return (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => toggleClass(cls)}
                        className={`p-3 rounded-xl border text-left transition flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-400 text-rose-950 font-bold shadow-xs'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <span className="text-xs truncate font-medium">{cls}</span>
                        <span
                          className={`text-[11px] px-1.5 py-0.5 rounded-full shrink-0 font-mono ${
                            isSelected
                              ? 'bg-rose-200 text-rose-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {count}节
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CLEAR ALL */}
          {activeTab === 'all' && (
            <div className="space-y-4 py-2">
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-rose-700 text-sm">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>确定要清空全周所有课程排课吗？</span>
                </div>
                <p>
                  此操作将清空当前课程表全部 <strong>{totalLessons}</strong> 节课的排课记录，表格将重置为空白状态。
                </p>
                <p className="text-[11px] text-rose-600">
                  （教师姓名、学校和作息时间设置仍将保留，不会丢失）
                </p>
              </div>

              {!confirmClearAllStep ? (
                <button
                  type="button"
                  onClick={() => setConfirmClearAllStep(true)}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  准备清空全周所有排课 (共 {totalLessons} 节)
                </button>
              ) : (
                <div className="space-y-2 animate-in fade-in duration-150">
                  <div className="text-center text-xs font-bold text-rose-700">
                    请二次确认：确定彻底清空全周全部课表？
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmClearAllStep(false)}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
                    >
                      手滑了，返回
                    </button>
                    <button
                      type="button"
                      onClick={handleExecuteClearAll}
                      className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                      确认彻底清空
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {activeTab === 'subject' && (
              <span>已选择 {selectedSubjects.length} 个科目</span>
            )}
            {activeTab === 'class' && (
              <span>已选择 {selectedClasses.length} 个班级</span>
            )}
            {activeTab === 'all' && <span>全周课表共 {totalLessons} 节</span>}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition"
            >
              取消
            </button>

            {activeTab === 'subject' && (
              <button
                type="button"
                disabled={selectedSubjects.length === 0}
                onClick={handleExecuteClearSubjects}
                className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                清空所选科目排课 ({selectedSubjects.length})
              </button>
            )}

            {activeTab === 'class' && (
              <button
                type="button"
                disabled={selectedClasses.length === 0}
                onClick={handleExecuteClearClasses}
                className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                清空所选班级排课 ({selectedClasses.length})
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
