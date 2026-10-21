import ExcelJS from 'exceljs';
import {
  TimetableConfig,
  CourseCell,
  DAYS_CONFIG,
  COLOR_PRESETS,
  DayInfo,
  Period,
} from '@/types/timetable';

export interface ExportOptions {
  config: TimetableConfig;
  schedule: Record<string, CourseCell>;
}

export async function exportTimetableToExcel({ config, schedule }: ExportOptions): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = '教师课程表生成系统';
  workbook.lastModifiedBy = config.teacherName || '任课教师';
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet('教师周课程表', {
    pageSetup: {
      orientation: 'landscape',
      paperSize: 9, // A4
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 1,
      margins: {
        left: 0.5,
        right: 0.5,
        top: 0.5,
        bottom: 0.5,
        header: 0.3,
        footer: 0.3,
      },
    },
    views: [{ showGridLines: true }],
  });

  const activeDays: DayInfo[] = config.includeWeekend
    ? DAYS_CONFIG
    : DAYS_CONFIG.filter((d) => d.dayOfWeek <= 5);

  const totalCols = 3 + activeDays.length; // 1: 时段, 2: 节次, 3: 作息时间, 4..N: 星期X

  // Set Column Widths
  const columnsConfig: Array<{ header?: string; key?: string; width: number }> = [
    { width: 9 },  // 时段
    { width: 10 }, // 节次
    { width: 16 }, // 作息时间
  ];
  activeDays.forEach(() => {
    columnsConfig.push({ width: 22 });
  });
  worksheet.columns = columnsConfig;

  // Thin Border definition
  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  };

  const headerBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FF94A3B8' } },
    left: { style: 'thin', color: { argb: 'FF94A3B8' } },
    bottom: { style: 'medium', color: { argb: 'FF475569' } },
    right: { style: 'thin', color: { argb: 'FF94A3B8' } },
  };

  let currentRowIdx = 1;

  // 1. Table Title (Merged across all columns)
  const titleText = `${config.schoolName ? `${config.schoolName} ` : ''}${config.academicYear ? `${config.academicYear} ` : ''}教师个人周课程表`;
  worksheet.mergeCells(currentRowIdx, 1, currentRowIdx, totalCols);
  const titleRow = worksheet.getRow(currentRowIdx);
  titleRow.height = 38;
  const titleCell = worksheet.getCell(currentRowIdx, 1);
  titleCell.value = titleText;
  titleCell.font = { name: 'Microsoft YaHei', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E3A8A' }, // Deep Education Blue
  };
  currentRowIdx++;

  // 2. Subheader Info Row (Teacher Name, Subject, Date)
  const now = new Date();
  const dateStr = `${now.getFullYear()}年${String(now.getMonth() + 1).padStart(2, '0')}月${String(now.getDate()).padStart(2, '0')}日`;
  worksheet.mergeCells(currentRowIdx, 1, currentRowIdx, totalCols);
  const subInfoRow = worksheet.getRow(currentRowIdx);
  subInfoRow.height = 24;
  const subInfoCell = worksheet.getCell(currentRowIdx, 1);
  
  const teacherDisplay = config.teacherName ? `任课教师：${config.teacherName}` : '任课教师：未填写';
  const groupDisplay = config.gradeSubject ? `教研组/年级：${config.gradeSubject}` : '';
  const dateDisplay = `制表日期：${dateStr}`;
  subInfoCell.value = `${teacherDisplay}       ${groupDisplay}       ${dateDisplay}`;
  subInfoCell.font = { name: 'Microsoft YaHei', size: 10, bold: true, color: { argb: 'FF334155' } };
  subInfoCell.alignment = { vertical: 'middle', horizontal: 'center' };
  subInfoCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF1F5F9' },
  };
  currentRowIdx++;

  // 3. Table Column Headers
  const colHeaderRow = worksheet.getRow(currentRowIdx);
  colHeaderRow.height = 28;
  const headers = ['时段', '节次', '作息时间', ...activeDays.map((d) => d.label)];
  headers.forEach((h, idx) => {
    const cell = worksheet.getCell(currentRowIdx, idx + 1);
    cell.value = h;
    cell.font = { name: 'Microsoft YaHei', size: 11, bold: true, color: { argb: 'FF1E293B' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE2E8F0' },
    };
    cell.border = headerBorder;
  });
  currentRowIdx++;

  // Group periods by section
  const morningPeriods = config.periods.filter((p) => p.section === 'morning');
  const afternoonPeriods = config.periods.filter((p) => p.section === 'afternoon');
  const eveningPeriods = config.periods.filter((p) => p.section === 'evening');

  // Helper to render a group of periods
  const renderSectionPeriods = (sectionName: string, periods: Period[], sectionBg: string) => {
    if (periods.length === 0) return;
    const startRow = currentRowIdx;
    
    periods.forEach((period) => {
      const row = worksheet.getRow(currentRowIdx);
      row.height = 54;

      // Period Name
      const periodNameCell = worksheet.getCell(currentRowIdx, 2);
      periodNameCell.value = period.name;
      periodNameCell.font = { name: 'Microsoft YaHei', size: 10, bold: true, color: { argb: 'FF334155' } };
      periodNameCell.alignment = { vertical: 'middle', horizontal: 'center' };
      periodNameCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF8FAFC' },
      };
      periodNameCell.border = thinBorder;

      // Time Range
      const timeCell = worksheet.getCell(currentRowIdx, 3);
      timeCell.value = `${period.startTime}\n~ ${period.endTime}`;
      timeCell.font = { name: 'Microsoft YaHei', size: 9, color: { argb: 'FF64748B' } };
      timeCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      timeCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF8FAFC' },
      };
      timeCell.border = thinBorder;

      // Days
      activeDays.forEach((day, dayIndex) => {
        const colIdx = 4 + dayIndex;
        const cell = worksheet.getCell(currentRowIdx, colIdx);
        const cellKey = `${day.dayOfWeek}_${period.id}`;
        const course = schedule[cellKey];

        cell.border = thinBorder;

        if (course && course.courseName.trim()) {
          // Find matching preset color
          const preset = COLOR_PRESETS.find(
            (p) => p.id === course.color || p.hex.toLowerCase() === course.color?.toLowerCase()
          ) || COLOR_PRESETS[0];

          // Build multi-line content
          let cellText = course.courseName;
          if (course.className) {
            cellText += `\n${course.className}`;
          }
          if (course.classroom) {
            cellText += `\n[${course.classroom}]`;
          }
          if (course.weeks && course.weeks !== '每周') {
            cellText += ` (${course.weeks})`;
          }

          cell.value = cellText;
          cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
          cell.font = {
            name: 'Microsoft YaHei',
            size: 10,
            bold: true,
            color: { argb: preset.excelText },
          };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: preset.excelFill },
          };
        } else {
          cell.value = '';
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFFFF' },
          };
        }
      });

      currentRowIdx++;
    });

    const endRow = currentRowIdx - 1;

    // Merge section name column
    worksheet.mergeCells(startRow, 1, endRow, 1);
    const sectionCell = worksheet.getCell(startRow, 1);
    sectionCell.value = sectionName;
    sectionCell.font = { name: 'Microsoft YaHei', size: 11, bold: true, color: { argb: 'FF1E293B' } };
    sectionCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    sectionCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: sectionBg },
    };
    for (let r = startRow; r <= endRow; r++) {
      worksheet.getCell(r, 1).border = thinBorder;
    }
  };

  // Render Morning
  if (morningPeriods.length > 0) {
    renderSectionPeriods('上\n午', morningPeriods, 'FFF1F5F9');
  }

  // Intermission / Noon Break Row
  if (morningPeriods.length > 0 && afternoonPeriods.length > 0) {
    worksheet.mergeCells(currentRowIdx, 1, currentRowIdx, totalCols);
    const breakRow = worksheet.getRow(currentRowIdx);
    breakRow.height = 22;
    const breakCell = worksheet.getCell(currentRowIdx, 1);
    breakCell.value = '— 午休 / 阳光就餐与休整 (11:45 ~ 14:00) —';
    breakCell.font = { name: 'Microsoft YaHei', size: 9, italic: true, color: { argb: 'FF64748B' } };
    breakCell.alignment = { vertical: 'middle', horizontal: 'center' };
    breakCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF8FAFC' },
    };
    breakCell.border = thinBorder;
    currentRowIdx++;
  }

  // Render Afternoon
  if (afternoonPeriods.length > 0) {
    renderSectionPeriods('下\n午', afternoonPeriods, 'FFF1F5F9');
  }

  // Evening Break & Evening Section
  if (eveningPeriods.length > 0) {
    worksheet.mergeCells(currentRowIdx, 1, currentRowIdx, totalCols);
    const eveningBreakRow = worksheet.getRow(currentRowIdx);
    eveningBreakRow.height = 20;
    const eveningBreakCell = worksheet.getCell(currentRowIdx, 1);
    eveningBreakCell.value = '— 晚自习 / 课后延时托管服务 —';
    eveningBreakCell.font = { name: 'Microsoft YaHei', size: 9, italic: true, color: { argb: 'FF64748B' } };
    eveningBreakCell.alignment = { vertical: 'middle', horizontal: 'center' };
    eveningBreakCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF8FAFC' },
    };
    eveningBreakCell.border = thinBorder;
    currentRowIdx++;

    renderSectionPeriods('晚\n上', eveningPeriods, 'FFF1F5F9');
  }

  // 4. Statistics and Remarks Footer
  let totalClasses = 0;
  Object.values(schedule).forEach((c) => {
    if (c?.courseName?.trim()) {
      totalClasses++;
    }
  });

  worksheet.mergeCells(currentRowIdx, 1, currentRowIdx, totalCols);
  const footerRow = worksheet.getRow(currentRowIdx);
  footerRow.height = 32;
  const footerCell = worksheet.getCell(currentRowIdx, 1);
  const remarksText = config.remarks ? `说明/备注：${config.remarks}` : '说明：空白时段为教研、备课或课间休息时间。';
  footerCell.value = `【周总课时】：共 ${totalClasses} 节课        ${remarksText}`;
  footerCell.font = { name: 'Microsoft YaHei', size: 9, color: { argb: 'FF475569' } };
  footerCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  footerCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF1F5F9' },
  };
  footerCell.border = thinBorder;

  // Generate buffer and trigger browser download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const formattedDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate()
  ).padStart(2, '0')}`;
  const teacherClean = (config.teacherName || '教师').replace(/[\\/:*?"<>|]/g, '_');
  const filename = `${teacherClean}_周课程表_${formattedDate}.xlsx`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
