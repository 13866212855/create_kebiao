'use client';

import React, { useRef } from 'react';
import {
  GraduationCap,
  Download,
  Printer,
  Sparkles,
  Trash2,
  Upload,
  FileDown,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

interface NavbarProps {
  lastSavedTime: string;
  isSaving: boolean;
  onExportExcel: () => void;
  onOpenPreview: () => void;
  onLoadSample: () => void;
  onOpenClearModal: (initialTab?: 'subject' | 'class' | 'all') => void;
  onImportExcel: (file: File) => void;
  onExportJsonBackup: () => void;
  onImportJsonBackup: (file: File) => void;
}

export default function Navbar({
  lastSavedTime,
  isSaving,
  onExportExcel,
  onOpenPreview,
  onLoadSample,
  onOpenClearModal,
  onImportExcel,
  onExportJsonBackup,
  onImportJsonBackup,
}: NavbarProps) {
  const excelInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  const handleExcelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportExcel(file);
      e.target.value = '';
    }
  };

  const handleJsonFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJsonBackup(file);
      e.target.value = '';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Left: Branding & Autosave status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
                教师周课程表生成系统
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Excel / 打印优化版
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                {isSaving ? '正在保存...' : `草稿已实时保存 (${lastSavedTime})`}
              </span>
            </div>
          </div>
        </div>

        {/* Hidden File Inputs */}
        <input
          type="file"
          ref={excelInputRef}
          accept=".xlsx,.xls"
          onChange={handleExcelFileChange}
          className="hidden"
        />
        <input
          type="file"
          ref={jsonInputRef}
          accept=".json"
          onChange={handleJsonFileChange}
          className="hidden"
        />

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Load Sample Data */}
          <button
            type="button"
            onClick={onLoadSample}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition"
            title="一键加载范例排课数据进行预览体验"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>范例课表</span>
          </button>

          {/* Import / Backup Dropdown Group */}
          <div className="relative group">
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">导入/备份</span>
            </button>
            <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1 hidden group-hover:block z-50 animate-in fade-in duration-150">
              <button
                type="button"
                onClick={() => excelInputRef.current?.click()}
                className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition"
              >
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                导入已有 Excel (.xlsx)
              </button>
              <button
                type="button"
                onClick={onExportJsonBackup}
                className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition"
              >
                <FileDown className="w-3.5 h-3.5 text-indigo-600" />
                导出 JSON 课表备份
              </button>
              <button
                type="button"
                onClick={() => jsonInputRef.current?.click()}
                className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition"
              >
                <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                恢复 JSON 备份文件
              </button>
              <div className="border-t border-slate-100 my-1" />
              <button
                type="button"
                onClick={() => onOpenClearModal('subject')}
                className="w-full text-left px-3.5 py-2 text-xs text-amber-700 hover:bg-amber-50 flex items-center gap-2 transition"
              >
                <Trash2 className="w-3.5 h-3.5 text-amber-600" />
                清空所选科目/班级排课...
              </button>
              <button
                type="button"
                onClick={() => onOpenClearModal('all')}
                className="w-full text-left px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                清空全周所有排课...
              </button>
            </div>
          </div>

          {/* Print Preview Button */}
          <button
            type="button"
            onClick={onOpenPreview}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition"
            title="打开预览与打印排版"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">预览 / 打印</span>
          </button>

          {/* Export to Excel Button (Primary CTA) */}
          <button
            type="button"
            onClick={onExportExcel}
            className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-md hover:shadow-lg shadow-blue-500/20 transition transform active:scale-98"
          >
            <Download className="w-4 h-4" />
            <span>生成并导出 Excel</span>
          </button>
        </div>
      </div>
    </header>
  );
}
