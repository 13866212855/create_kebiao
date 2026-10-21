'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import BasicInfoCard from '@/components/BasicInfoCard';
import QuickSubjectBar from '@/components/QuickSubjectBar';
import TimetableGrid from '@/components/TimetableGrid';
import CourseStatsCard from '@/components/CourseStatsCard';
import CellEditModal from '@/components/CellEditModal';
import DayCopyModal from '@/components/DayCopyModal';
import PeriodSettingsModal from '@/components/PeriodSettingsModal';
import PreviewModal from '@/components/PreviewModal';
import ClearScheduleModal from '@/components/ClearScheduleModal';
import {
  TimetableConfig,
  CourseCell,
  Period,
  DEFAULT_PERIODS,
  COURSE_COLOR_MAP,
  LastUsedCourseConfig,
} from '@/types/timetable';
import { SAMPLE_CONFIG, SAMPLE_SCHEDULE } from '@/lib/sampleData';
import { exportTimetableToExcel } from '@/lib/excelExport';
import { parseExcelTimetable } from '@/lib/excelImport';
import {
  FileSpreadsheet,
  Info,
  Sparkles,
  Lightbulb,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

const STORAGE_KEY = 'TEACHER_TIMETABLE_V1';

export default function Home() {
  // State
  const [config, setConfig] = useState<TimetableConfig>(SAMPLE_CONFIG);
  const [schedule, setSchedule] = useState<Record<string, CourseCell>>(SAMPLE_SCHEDULE);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState('刚刚');

  // Interactive modes
  const [activeBrushSubject, setActiveBrushSubject] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Modals state
  const [editingCell, setEditingCell] = useState<{
    dayOfWeek: number;
    period: Period | null;
  }>({ dayOfWeek: 1, period: null });
  const [isCellModalOpen, setIsCellModalOpen] = useState(false);

  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [copySourceDay, setCopySourceDay] = useState(1);

  const [isPeriodSettingsOpen, setIsPeriodSettingsOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [clearModalInitialTab, setClearModalInitialTab] = useState<'subject' | 'class' | 'all'>('subject');

  // Remembers the last entered course configuration (subject, color, classroom, class) for rapid entry
  const [lastUsedCourse, setLastUsedCourse] = useState<LastUsedCourseConfig | null>({
    courseName: '数学',
    color: 'blue',
    classroom: '博学楼201',
    weeks: '每周',
    className: '高二（1）',
  });

  // Count scheduled lessons per subject for quick indicator and 1-click clearing
  const scheduledSubjectCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(schedule).forEach((cell) => {
      if (cell?.courseName?.trim()) {
        const sub = cell.courseName.trim();
        counts[sub] = (counts[sub] || 0) + 1;
      }
    });
    return counts;
  }, [schedule]);

  // Show toast notification helper
  const showToast = useCallback((text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // 1. Initial Load from localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.config && parsed.schedule) {
            setConfig(parsed.config);
            setSchedule(parsed.schedule);
          }
        }
        const storedLastCourse = localStorage.getItem('TEACHER_TIMETABLE_LAST_COURSE');
        if (storedLastCourse) {
          setLastUsedCourse(JSON.parse(storedLastCourse));
        }
      } catch (e) {
        console.error('Failed to load timetable from localStorage:', e);
      } finally {
        setIsLoaded(true);
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setLastSavedTime(timeStr);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // 2. Real-time Save to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    const timer = setTimeout(() => {
      setIsSaving(true);
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            config,
            schedule,
            updatedAt: new Date().toISOString(),
          })
        );
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setLastSavedTime(timeStr);
      } catch (e) {
        console.error('Error saving to localStorage:', e);
      } finally {
        setIsSaving(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [config, schedule, isLoaded]);

  // Update Config
  const handleConfigChange = (updated: Partial<TimetableConfig>) => {
    setConfig((prev) => ({ ...prev, ...updated }));
  };

  // Cell Editing
  const handleOpenCell = (dayOfWeek: number, period: Period) => {
    setEditingCell({ dayOfWeek, period });
    setIsCellModalOpen(true);
  };

  const handleSaveCell = (cellData: CourseCell) => {
    if (!editingCell.period) return;
    const key = `${editingCell.dayOfWeek}_${editingCell.period.id}`;
    setSchedule((prev) => ({
      ...prev,
      [key]: cellData,
    }));
    // Persist as last used course configuration for next cell preselection
    const updatedLast: LastUsedCourseConfig = {
      courseName: cellData.courseName,
      className: cellData.className,
      classroom: cellData.classroom,
      weeks: cellData.weeks,
      color: cellData.color,
    };
    setLastUsedCourse(updatedLast);
    try {
      localStorage.setItem('TEACHER_TIMETABLE_LAST_COURSE', JSON.stringify(updatedLast));
    } catch (e) {
      console.error(e);
    }
    showToast(`已排入：${cellData.courseName}`);
  };

  const handleClearCell = (dayOfWeek: number, periodId: string) => {
    const key = `${dayOfWeek}_${periodId}`;
    setSchedule((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    showToast('已清空该时段课程', 'info');
  };

  // Quick Brush Fill
  const handleQuickFillCell = (dayOfWeek: number, periodId: string, subject: string) => {
    const key = `${dayOfWeek}_${periodId}`;
    const autoColor = COURSE_COLOR_MAP[subject] || 'blue';
    const newCell: CourseCell = {
      courseName: subject,
      className: '',
      color: autoColor,
      weeks: '每周',
    };
    setSchedule((prev) => ({
      ...prev,
      [key]: newCell,
    }));
    const updatedLast: LastUsedCourseConfig = {
      courseName: subject,
      color: autoColor,
      weeks: '每周',
    };
    setLastUsedCourse(updatedLast);
    try {
      localStorage.setItem('TEACHER_TIMETABLE_LAST_COURSE', JSON.stringify(updatedLast));
    } catch (e) {
      console.error(e);
    }
    showToast(`一键填入 [${subject}]`);
  };

  // Clear Day
  const handleClearDay = (dayOfWeek: number) => {
    setSchedule((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        if (k.startsWith(`${dayOfWeek}_`)) {
          delete next[k];
        }
      });
      return next;
    });
    showToast(`已清空所选日期的排课`, 'info');
  };

  // Copy Day
  const handleOpenCopyDay = (dayOfWeek: number) => {
    setCopySourceDay(dayOfWeek);
    setIsCopyModalOpen(true);
  };

  const handleExecuteCopyDay = (sourceDay: number, targetDays: number[], overwrite: boolean) => {
    setSchedule((prev) => {
      const next = { ...prev };

      // Collect all source day courses
      const sourceMap: Record<string, CourseCell> = {};
      config.periods.forEach((p) => {
        const srcKey = `${sourceDay}_${p.id}`;
        if (prev[srcKey]) {
          sourceMap[p.id] = prev[srcKey];
        }
      });

      targetDays.forEach((targetDay) => {
        config.periods.forEach((p) => {
          const targetKey = `${targetDay}_${p.id}`;
          const srcCell = sourceMap[p.id];

          if (overwrite) {
            if (srcCell) {
              next[targetKey] = { ...srcCell };
            } else {
              delete next[targetKey];
            }
          } else {
            // Keep existing if occupied
            if (!next[targetKey] && srcCell) {
              next[targetKey] = { ...srcCell };
            }
          }
        });
      });

      return next;
    });
    showToast(`成功复制课程到 ${targetDays.length} 个工作日！`);
  };

  // Open Clear Schedule Management Modal
  const handleOpenClearModal = (initialTab: 'subject' | 'class' | 'all' = 'subject') => {
    setClearModalInitialTab(initialTab);
    setIsClearModalOpen(true);
  };

  // Clear specific selected subjects
  const handleClearBySubjects = (subjects: string[]) => {
    let count = 0;
    setSchedule((prev) => {
      const next = { ...prev };
      Object.entries(next).forEach(([k, cell]) => {
        if (cell?.courseName && subjects.includes(cell.courseName.trim())) {
          delete next[k];
          count++;
        }
      });
      return next;
    });
    showToast(`已成功清空所选科目【${subjects.join('、')}】的全部排课（共 ${count} 节）`);
  };

  // Clear specific selected classes
  const handleClearByClasses = (classes: string[]) => {
    let count = 0;
    setSchedule((prev) => {
      const next = { ...prev };
      Object.entries(next).forEach(([k, cell]) => {
        if (cell?.className && classes.includes(cell.className.trim())) {
          delete next[k];
          count++;
        }
      });
      return next;
    });
    showToast(`已成功清空所选班级【${classes.join('、')}】的全部排课（共 ${count} 节）`);
  };

  // Clear All Schedule (Confirmed from ClearScheduleModal)
  const handleClearAll = () => {
    setSchedule({});
    showToast('已清空全周所有课程排课，表格已重置为空白', 'info');
  };

  // Load Sample Demo Data
  const handleLoadSample = () => {
    setConfig(SAMPLE_CONFIG);
    setSchedule(SAMPLE_SCHEDULE);
    showToast('已加载教师范例课表数据');
  };

  // Export Excel
  const handleExportExcel = async () => {
    if (!config.teacherName.trim()) {
      showToast('请在上方输入教师姓名后再导出 Excel', 'error');
      return;
    }
    try {
      showToast('正在生成并格式化 Excel 文件...', 'info');
      await exportTimetableToExcel({ config, schedule });
      showToast('Excel 文件生成成功，已开始下载！');
    } catch (e: any) {
      console.error(e);
      showToast(`导出失败：${e.message || '未知错误'}`, 'error');
    }
  };

  // Import Excel (.xlsx)
  const handleImportExcel = async (file: File) => {
    try {
      showToast('正在解析 Excel 课程表...', 'info');
      const result = await parseExcelTimetable(file);
      if (result.configPartial) {
        setConfig((prev) => ({ ...prev, ...result.configPartial }));
      }
      setSchedule(result.schedule);
      showToast(`Excel 导入成功！共解析识别到 ${result.totalFound} 节课程`);
    } catch (e: any) {
      console.error(e);
      showToast(`Excel 解析失败：${e.message || '文件格式不符'}`, 'error');
    }
  };

  // Export JSON Backup
  const handleExportJsonBackup = () => {
    const dataStr = JSON.stringify({ config, schedule }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.teacherName || '教师'}_课程表备份_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('课表备份 JSON 文件已下载');
  };

  // Import JSON Backup
  const handleImportJsonBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed.config && parsed.schedule) {
          setConfig(parsed.config);
          setSchedule(parsed.schedule);
          showToast('已成功从 JSON 备份恢复课表！');
        } else {
          showToast('JSON 备份文件格式不符', 'error');
        }
      } catch (err) {
        showToast('JSON 文件解析失败', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg border text-xs font-semibold animate-in slide-in-from-bottom-3 duration-200 bg-white border-slate-200 text-slate-800">
          {toastMessage.type === 'success' && (
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
          )}
          {toastMessage.type === 'info' && (
            <Info className="w-4 h-4 text-blue-500 shrink-0" />
          )}
          {toastMessage.type === 'error' && (
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        lastSavedTime={lastSavedTime}
        isSaving={isSaving}
        onExportExcel={handleExportExcel}
        onOpenPreview={() => setIsPreviewOpen(true)}
        onLoadSample={handleLoadSample}
        onOpenClearModal={handleOpenClearModal}
        onImportExcel={handleImportExcel}
        onExportJsonBackup={handleExportJsonBackup}
        onImportJsonBackup={handleImportJsonBackup}
      />

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5 flex-1 w-full">
        {/* Top Tip Banner */}
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-sky-50 border border-blue-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-900 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs shrink-0">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold">高效排课小提示：</span>
              <span className="text-blue-800/90 ml-1">
                点击表格任意格子即可编辑排课；可使用“常用科目刷”一键连点填充；点击周标题栏的“复制”可整天批量排课。
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="px-3 py-1.5 bg-white text-blue-700 hover:bg-blue-100/60 font-semibold rounded-xl border border-blue-200 transition shadow-2xs"
            >
              打印与样式预览
            </button>
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow-2xs flex items-center gap-1"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              导出 .xlsx
            </button>
          </div>
        </div>

        {/* 1. Basic Info Card */}
        <BasicInfoCard
          config={config}
          onChange={handleConfigChange}
          onOpenPeriodSettings={() => setIsPeriodSettingsOpen(true)}
        />

        {/* 2. Course Statistics Summary */}
        <CourseStatsCard config={config} schedule={schedule} />

        {/* 3. Quick Subject Palette & Brush Bar */}
        <QuickSubjectBar
          activeBrushSubject={activeBrushSubject}
          scheduledSubjectCounts={scheduledSubjectCounts}
          lastUsedSubject={lastUsedCourse?.courseName}
          onSelectBrush={(sub) => setActiveBrushSubject(sub)}
          onClearSubject={(sub) => handleClearBySubjects([sub])}
          onOpenClearModal={() => handleOpenClearModal('subject')}
        />

        {/* 4. Main Timetable Schedule Grid */}
        <TimetableGrid
          config={config}
          schedule={schedule}
          activeBrushSubject={activeBrushSubject}
          onCellClick={handleOpenCell}
          onCellClear={handleClearCell}
          onQuickFillCell={handleQuickFillCell}
          onOpenCopyDay={handleOpenCopyDay}
          onClearDay={handleClearDay}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>教师周课程表生成系统 · 自动保存到本地存储 · 支持一键导出标准 Excel 表格</span>
          <div className="flex items-center gap-4 text-slate-400">
            <span>A4 横版优化</span>
            <span>·</span>
            <span>作息时间自定义</span>
            <span>·</span>
            <span>无须注册即开即用</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {/* 1. Cell Edit Modal */}
      <CellEditModal
        key={`${editingCell.dayOfWeek}_${editingCell.period?.id || 'none'}_${isCellModalOpen ? '1' : '0'}`}
        isOpen={isCellModalOpen}
        onClose={() => setIsCellModalOpen(false)}
        dayOfWeek={editingCell.dayOfWeek}
        period={editingCell.period}
        initialData={
          editingCell.period
            ? schedule[`${editingCell.dayOfWeek}_${editingCell.period.id}`]
            : undefined
        }
        lastUsedCourse={lastUsedCourse}
        onSave={handleSaveCell}
        onClear={() => {
          if (editingCell.period) {
            handleClearCell(editingCell.dayOfWeek, editingCell.period.id);
          }
        }}
      />

      {/* 2. Day Copy Modal */}
      <DayCopyModal
        isOpen={isCopyModalOpen}
        onClose={() => setIsCopyModalOpen(false)}
        schedule={schedule}
        includeWeekend={config.includeWeekend}
        defaultSourceDay={copySourceDay}
        onCopyDay={handleExecuteCopyDay}
      />

      {/* 3. Period Settings Modal */}
      <PeriodSettingsModal
        isOpen={isPeriodSettingsOpen}
        onClose={() => setIsPeriodSettingsOpen(false)}
        periods={config.periods || DEFAULT_PERIODS}
        onSave={(newPeriods) => handleConfigChange({ periods: newPeriods })}
      />

      {/* 4. Preview Modal */}
      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        config={config}
        schedule={schedule}
        onExportExcel={handleExportExcel}
      />

      {/* 5. Clear Schedule Modal */}
      <ClearScheduleModal
        key={`${isClearModalOpen ? '1' : '0'}_${clearModalInitialTab}`}
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        schedule={schedule}
        onClearBySubjects={handleClearBySubjects}
        onClearByClasses={handleClearByClasses}
        onClearAll={handleClearAll}
      />
    </div>
  );
}
