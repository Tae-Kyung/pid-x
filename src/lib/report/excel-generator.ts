import ExcelJS from 'exceljs';

/** 새 Workbook 생성 */
export function createWorkbook(): ExcelJS.Workbook {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'PID-X';
  wb.created = new Date();
  return wb;
}

/** 헤더 행 스타일 적용 */
export function applyHeaderStyle(ws: ExcelJS.Worksheet, rowNumber: number = 1) {
  const row = ws.getRow(rowNumber);
  row.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
    };
  });
  row.height = 24;
}

/** 내용 기반 열 너비 자동 조절 */
export function autoColumnWidth(ws: ExcelJS.Worksheet) {
  ws.columns.forEach((col) => {
    let maxLen = 10;
    col.eachCell?.({ includeEmpty: false }, (cell) => {
      const val = cell.value?.toString() || '';
      maxLen = Math.max(maxLen, val.length + 2);
    });
    col.width = Math.min(maxLen, 50);
  });
}

/** 자동 필터 설정 */
export function applyFilter(ws: ExcelJS.Worksheet) {
  const lastCol = ws.columns.length;
  const lastRow = ws.rowCount;
  if (lastCol > 0 && lastRow > 0) {
    ws.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: lastRow, column: lastCol },
    };
  }
}

/** 데이터 행 테두리 적용 */
export function applyDataBorders(ws: ExcelJS.Worksheet, startRow: number = 2) {
  for (let r = startRow; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD9D9D9' } },
        bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
        left: { style: 'thin', color: { argb: 'FFD9D9D9' } },
        right: { style: 'thin', color: { argb: 'FFD9D9D9' } },
      };
      cell.font = { size: 10 };
    });
  }
}

/** 조건부 서식: 대구경 라인 강조 (12" 이상) */
export function highlightLargeSize(ws: ExcelJS.Worksheet, sizeColIndex: number, startRow: number = 2) {
  for (let r = startRow; r <= ws.rowCount; r++) {
    const cell = ws.getCell(r, sizeColIndex);
    const val = cell.value?.toString() || '';
    const num = parseFloat(val.replace(/[^0-9.]/g, ''));
    if (!isNaN(num) && num >= 12) {
      ws.getRow(r).eachCell((c) => {
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
      });
    }
  }
}
