/**
 * T-020b: Golden Joint 파서
 * PRD [FR-108]: "Golden Joint" 키워드 검색, 인접 라인/패키지 추출
 */
import { createServiceClient } from '@/lib/supabase/server';

interface PageTextRow {
  id: string;
  page_number: number;
  raw_text: string;
}

export interface GoldenJointData {
  sourcePage: number;
  relatedLines: string[];
}

// Golden Joint 키워드 (case insensitive)
const GJ_KEYWORD_REGEX = /golden\s*joint/gi;

// 인접 라인번호 추출 (Golden Joint 키워드 주변)
const LINE_REGEX_NEARBY = /(\d{1,2})["']\s*-\s*([A-Z]{1,4})\s*-\s*(\d{3,5})(?:\s*-\s*([A-Z0-9]{2,10}))?/g;

export function parseGoldenJoints(pageTexts: PageTextRow[]): GoldenJointData[] {
  const results: GoldenJointData[] = [];
  const seenPages = new Set<number>();

  for (const pt of pageTexts) {
    const text = pt.raw_text;
    const gjMatches = [...text.matchAll(GJ_KEYWORD_REGEX)];

    if (gjMatches.length === 0) continue;
    if (seenPages.has(pt.page_number)) continue;
    seenPages.add(pt.page_number);

    // 해당 페이지에서 인접 라인번호 추출
    const lineMatches = [...text.matchAll(LINE_REGEX_NEARBY)];
    const relatedLines = lineMatches.map((m) => {
      const spec = m[4] ? `-${m[4]}` : '';
      return `${m[1]}"-${m[2]}-${m[3]}${spec}`;
    });

    // 중복 제거
    const uniqueLines = [...new Set(relatedLines)];

    results.push({
      sourcePage: pt.page_number,
      relatedLines: uniqueLines,
    });
  }

  return results;
}

/**
 * Golden Joint 데이터를 DB에 저장
 */
export async function saveGoldenJoints(
  projectId: string,
  joints: GoldenJointData[]
): Promise<number> {
  const supabase = createServiceClient();

  if (joints.length === 0) return 0;

  const records = joints.map((gj) => ({
    project_id: projectId,
    source_page: gj.sourcePage,
    related_lines: gj.relatedLines,
    status: 'identified' as const,
  }));

  const { error } = await supabase.from('golden_joints').insert(records);
  return error ? 0 : records.length;
}
