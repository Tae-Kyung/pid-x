/**
 * T-017: 배관 라인 번호 파서 (핵심)
 * PRD [FR-104]: 정확도 90%, 라인번호 구조 [SIZE]-[SERVICE]-[NUMBER]-[SPEC]
 */
import { createServiceClient } from '@/lib/supabase/server';

interface PageTextRow {
  id: string;
  page_number: number;
  raw_text: string;
}

export interface LineData {
  lineNumber: string;
  nominalSize: string;
  serviceCode: string;
  specClass: string | null;
  sourcePages: number[];
}

// 도면번호 패턴 (노이즈 필터링용)
const DRAWING_NO_PATTERN = /[A-Z0-9]{2,6}-[A-Z]{2,4}-\d{4}-[A-Z]{2,4}-PID/;

// 1차 라인번호 Regex: SIZE"-SERVICE-NUMBER-SPEC
const LINE_REGEX_PRIMARY =
  /(\d{1,2})\s*["'"]\s*[-]?\s*([A-Z]{1,4})\s*[-]\s*(\d{3,5})\s*[-]?\s*([A-Z0-9]{2,10})?/g;

// 2차 라인번호 Regex: 변형 패턴 (공백 분리)
const LINE_REGEX_SECONDARY =
  /(\d{1,2})"\s*-\s*([A-Z]{1,4})\s*-\s*(\d{3,5})(?:\s*-\s*([A-Z0-9]{2,10}))?/g;

// 유효한 서비스 코드 목록
const VALID_SERVICES = new Set([
  'P', 'SG', 'CW', 'FW', 'BW', 'CA', 'IA', 'PA', 'N', 'FG', 'RG',
  'EG', 'HC', 'HO', 'LO', 'SO', 'CD', 'HD', 'LP', 'HP', 'MP',
  'SW', 'WW', 'DW', 'PW', 'VE', 'FL', 'DR', 'BD', 'HH', 'LL',
  'ST', 'SC', 'NH', 'OW', 'GN', 'PR', 'EX', 'PP',
]);

export function parseLines(pageTexts: PageTextRow[]): LineData[] {
  const lineMap = new Map<string, LineData>();

  for (const pt of pageTexts) {
    const text = pt.raw_text;

    // 1차 + 2차 패턴 적용
    const allMatches = [
      ...text.matchAll(LINE_REGEX_PRIMARY),
      ...text.matchAll(LINE_REGEX_SECONDARY),
    ];

    for (const match of allMatches) {
      const fullMatch = match[0];
      const size = match[1];
      const service = match[2];
      const number = match[3];
      const spec = match[4] || null;

      // 노이즈 필터링
      if (DRAWING_NO_PATTERN.test(fullMatch)) continue;

      const sizeNum = parseInt(size, 10);
      if (sizeNum === 0 || sizeNum > 60) continue;

      // 서비스 코드 검증 (알려진 코드만 또는 1~4글자 대문자)
      if (service.length > 4) continue;

      // 라인번호 정규화
      const lineNumber = spec
        ? `${size}"-${service}-${number}-${spec}`
        : `${size}"-${service}-${number}`;

      if (lineMap.has(lineNumber)) {
        const existing = lineMap.get(lineNumber)!;
        if (!existing.sourcePages.includes(pt.page_number)) {
          existing.sourcePages.push(pt.page_number);
        }
      } else {
        lineMap.set(lineNumber, {
          lineNumber,
          nominalSize: `${size}"`,
          serviceCode: service,
          specClass: spec,
          sourcePages: [pt.page_number],
        });
      }
    }
  }

  return [...lineMap.values()];
}

/**
 * 라인 데이터를 DB에 벌크 인서트
 */
export async function saveLines(
  projectId: string,
  lines: LineData[],
  unitIdMap: Map<string, string>
): Promise<number> {
  const supabase = createServiceClient();
  const BATCH_SIZE = 50;
  let inserted = 0;

  for (let i = 0; i < lines.length; i += BATCH_SIZE) {
    const batch = lines.slice(i, i + BATCH_SIZE).map((line) => ({
      project_id: projectId,
      line_number: line.lineNumber,
      nominal_size: line.nominalSize,
      service_code: line.serviceCode,
      spec_class: line.specClass,
      source_pages: line.sourcePages,
      status: 'extracted' as const,
    }));

    const { error } = await supabase
      .from('pipe_lines')
      .upsert(batch, { onConflict: 'project_id,line_number', ignoreDuplicates: true });

    if (!error) inserted += batch.length;
  }

  return inserted;
}
