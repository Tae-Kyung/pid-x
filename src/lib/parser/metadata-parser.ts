/**
 * T-016: 도면 메타데이터 파서
 * PRD [FR-103]: Drawing No, Unit Code, Revision, Rev Date 추출
 */
import { createServiceClient } from '@/lib/supabase/server';

interface PageTextRow {
  id: string;
  page_number: number;
  raw_text: string;
}

export interface DrawingData {
  drawingNo: string;
  unitCode: string;
  title: string | null;
  revision: string | null;
  revDate: string | null;
  pageStart: number;
  pageEnd: number;
}

export interface MetadataResult {
  drawings: DrawingData[];
  units: string[]; // 고유 유닛 코드 목록
}

// Drawing No 패턴: A8RX-CHT-XXXX-PRC-PID-XXX (또는 유사 프로젝트 도면번호)
const DRAWING_NO_REGEX = /[A-Z0-9]{2,6}-[A-Z]{2,4}-(\d{4})-[A-Z]{2,4}-PID-(\d{3})(?:-(\d{2}))?/g;

// Revision 패턴
const REVISION_REGEX = /(?:ISSUED\s+FOR\s+(\w+)(?:\s*\(([^)]+)\))?)|(?:Rev\.?\s*(\w+))/gi;

// Rev Date 패턴
const REV_DATE_REGEX = /(\d{1,2}[-/][A-Z]{3}[-/]\d{2,4})/gi;

export function parseMetadata(pageTexts: PageTextRow[]): MetadataResult {
  // 페이지 → 도면번호 매핑
  const pageDrawingMap = new Map<number, string>();
  const drawingPages = new Map<string, number[]>();
  const drawingRevision = new Map<string, string>();
  const drawingRevDate = new Map<string, string>();

  for (const pt of pageTexts) {
    const text = pt.raw_text;
    const matches = [...text.matchAll(DRAWING_NO_REGEX)];

    for (const match of matches) {
      const drawingNo = match[0];
      pageDrawingMap.set(pt.page_number, drawingNo);

      if (!drawingPages.has(drawingNo)) {
        drawingPages.set(drawingNo, []);
      }
      drawingPages.get(drawingNo)!.push(pt.page_number);
    }

    // Revision 추출 (첫 매치)
    const revMatches = [...text.matchAll(REVISION_REGEX)];
    if (revMatches.length > 0 && matches.length > 0) {
      const drawingNo = matches[0][0];
      const revMatch = revMatches[0];
      const rev = revMatch[3] || revMatch[1] || '';
      if (rev && !drawingRevision.has(drawingNo)) {
        drawingRevision.set(drawingNo, rev);
      }
    }

    // Rev Date 추출
    const dateMatches = [...text.matchAll(REV_DATE_REGEX)];
    if (dateMatches.length > 0 && matches.length > 0) {
      const drawingNo = matches[0][0];
      if (!drawingRevDate.has(drawingNo)) {
        drawingRevDate.set(drawingNo, dateMatches[0][1]);
      }
    }
  }

  // 도면번호 → DrawingData 변환
  const drawings: DrawingData[] = [];
  const unitCodes = new Set<string>();

  for (const [drawingNo, pages] of drawingPages) {
    const sortedPages = pages.sort((a, b) => a - b);
    // 유닛 코드: 도면번호의 4자리 숫자 그룹
    const unitMatch = drawingNo.match(/-(\d{4})-/);
    const unitCode = unitMatch ? unitMatch[1] : '0000';
    unitCodes.add(unitCode);

    drawings.push({
      drawingNo,
      unitCode,
      title: null, // 타이틀 블록 파싱은 별도 로직 필요
      revision: drawingRevision.get(drawingNo) || null,
      revDate: drawingRevDate.get(drawingNo) || null,
      pageStart: sortedPages[0],
      pageEnd: sortedPages[sortedPages.length - 1],
    });
  }

  return {
    drawings,
    units: [...unitCodes].sort(),
  };
}

/**
 * 유닛 + 도면을 DB에 저장 (upsert)
 */
export async function saveMetadata(
  projectId: string,
  result: MetadataResult
): Promise<Map<string, string>> {
  const supabase = createServiceClient();
  const unitIdMap = new Map<string, string>(); // unitCode → unitId

  // 유닛 upsert
  for (const code of result.units) {
    const { data } = await supabase
      .from('units')
      .upsert({ project_id: projectId, code }, { onConflict: 'project_id,code' })
      .select('id')
      .single();
    if (data) unitIdMap.set(code, data.id);
  }

  // 도면 upsert (unit_id 연결)
  const BATCH_SIZE = 50;
  for (let i = 0; i < result.drawings.length; i += BATCH_SIZE) {
    const batch = result.drawings.slice(i, i + BATCH_SIZE).map((d) => ({
      unit_id: unitIdMap.get(d.unitCode) || unitIdMap.values().next().value!,
      drawing_no: d.drawingNo,
      title: d.title,
      revision: d.revision,
      rev_date: d.revDate,
      page_start: d.pageStart,
      page_end: d.pageEnd,
    }));

    await supabase.from('drawings').insert(batch);
  }

  return unitIdMap;
}
