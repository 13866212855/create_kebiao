import ExcelJS from 'exceljs';
import { CourseCell, TimetableConfig, COLOR_PRESETS } from '@/types/timetable';

export interface ImportResult {
  configPartial?: Partial<TimetableConfig>;
  schedule: Record<string, CourseCell>;
  totalFound: number;
}

export async function parseExcelTimetable(file: File): Promise<ImportResult> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error('未在Excel文件中找到有效的工作表');
  }

  const schedule: Record<string, CourseCell> = {};
  let teacherName = '';
  let academicYear = '';
  let schoolName = '';
  let totalFound = 0;

  // Scan title row (usually row 1)
  const titleCellVal = worksheet.getRow(1).getCell(1).text;
  if (titleCellVal) {
    if (titleCellVal.includes('学年') || titleCellVal.includes('学期')) {
      const match = titleCellVal.match(/(\d{4}[-~至]\d{4}学年\s*(?:第[一二12]学期)?)/);
      if (match) academicYear = match[1];
    }
    if (titleCellVal.includes('中学') || titleCellVal.includes('小学') || titleCellVal.includes('大学') || titleCellVal.includes('学校')) {
      const matchSchool = titleCellVal.match(/([\u4e00-\u9fa5]+(?:中学|小学|大学|学校|学院))/);
      if (matchSchool) schoolName = matchSchool[1];
    }
  }

  // Scan sub-info (row 2)
  const subInfoVal = worksheet.getRow(2).getCell(1).text;
  if (subInfoVal) {
    const teacherMatch = subInfoVal.match(/(?:教师姓名|任课教师|教师|姓名)[：:\s]+([\u4e00-\u9fa5a-zA-Z·]+)/);
    if (teacherMatch) teacherName = teacherMatch[1].trim();
  }

  // Look for header row that contains 星期一 or 周一
  let headerRowIdx = -1;
  const dayColMap: Record<number, number> = {}; // dayOfWeek (1-7) -> colIndex

  worksheet.eachRow((row, rowNumber) => {
    if (headerRowIdx !== -1) return;
    row.eachCell((cell, colNumber) => {
      const text = cell.text.trim();
      if (text.includes('星期一') || text === '周一') {
        headerRowIdx = rowNumber;
      }
    });
  });

  if (headerRowIdx === -1) {
    // Default fallback to row 3
    headerRowIdx = 3;
  }

  // Map columns in headerRow
  const headerRow = worksheet.getRow(headerRowIdx);
  headerRow.eachCell((cell, colNumber) => {
    const text = cell.text.trim();
    if (text.includes('一')) dayColMap[1] = colNumber;
    else if (text.includes('二')) dayColMap[2] = colNumber;
    else if (text.includes('三')) dayColMap[3] = colNumber;
    else if (text.includes('四')) dayColMap[4] = colNumber;
    else if (text.includes('五')) dayColMap[5] = colNumber;
    else if (text.includes('六')) dayColMap[6] = colNumber;
    else if (text.includes('日') || text.includes('天')) dayColMap[7] = colNumber;
  });

  // Period mapping by row:
  // Usually rows follow 第1节, 第2节, etc.
  let currentPeriodNumber = 1;
  const maxRow = worksheet.rowCount;

  for (let r = headerRowIdx + 1; r <= maxRow; r++) {
    const row = worksheet.getRow(r);
    const rowText = row.values ? row.values.toString() : '';

    // Skip break rows
    if (rowText.includes('午休') || rowText.includes('大课间') || rowText.includes('周总课时') || rowText.includes('说明')) {
      continue;
    }

    // Determine period id
    let periodId = '';
    const periodCellVal = (row.getCell(2).text || row.getCell(1).text).trim();
    const matchNum = periodCellVal.match(/\d+/);
    const num = matchNum ? parseInt(matchNum[0], 10) : currentPeriodNumber;

    if (num <= 4) {
      periodId = `m${num}`;
    } else if (num <= 8) {
      periodId = `a${num - 4}`;
    } else {
      periodId = `e${num - 8}`;
    }

    let hasAnyDataInRow = false;

    // Parse each day
    Object.entries(dayColMap).forEach(([dayStr, colNum]) => {
      const dayOfWeek = parseInt(dayStr, 10);
      const cell = row.getCell(colNum);
      const rawText = cell.text ? cell.text.trim() : '';

      if (rawText && !rawText.includes('午休') && !rawText.includes('休息')) {
        hasAnyDataInRow = true;
        totalFound++;

        // Parse lines: courseName, className, classroom
        const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
        const courseName = lines[0] || '课程';
        const className = lines[1] || '';
        let classroom = lines[2] || '';
        if (classroom.startsWith('[') && classroom.endsWith(']')) {
          classroom = classroom.slice(1, -1);
        }

        // Determine color from cell fill if available, or default
        let matchedColor = 'blue';
        if (courseName.includes('语')) matchedColor = 'rose';
        else if (courseName.includes('英')) matchedColor = 'emerald';
        else if (courseName.includes('数')) matchedColor = 'blue';
        else if (courseName.includes('理') || courseName.includes('化')) matchedColor = 'purple';
        else if (courseName.includes('班') || courseName.includes('会')) matchedColor = 'amber';

        schedule[`${dayOfWeek}_${periodId}`] = {
          courseName,
          className,
          classroom,
          weeks: '每周',
          color: matchedColor,
        };
      }
    });

    if (hasAnyDataInRow) {
      currentPeriodNumber++;
    }
  }

  return {
    configPartial: {
      ...(teacherName ? { teacherName } : {}),
      ...(academicYear ? { academicYear } : {}),
      ...(schoolName ? { schoolName } : {}),
    },
    schedule,
    totalFound,
  };
}
