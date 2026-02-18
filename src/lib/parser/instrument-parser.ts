/**
 * T-020a: 계장 태그 파서
 * PRD [FR-107]: 정확도 80%, Function Letter 분류
 */
import { createServiceClient } from '@/lib/supabase/server';

interface PageTextRow {
  id: string;
  page_number: number;
  raw_text: string;
}

export interface InstrumentData {
  tagNo: string;
  functionType: string;
  sourcePages: number[];
}

// 계장 태그 패턴: [FUNCTION LETTER(S)]-[NUMBER]
// F=Flow, T=Temperature, P=Pressure, L=Level, A=Analyzer, S=Speed
const INSTRUMENT_REGEX = /\b([TFPLSA]I[CTRASHLV]?)-(\d{4,5})\b/g;

// Function Type 분류
const FUNCTION_MAP: Record<string, string> = {
  'FI': 'Flow Indicator',
  'FIC': 'Flow Indicating Controller',
  'FIT': 'Flow Indicating Transmitter',
  'TI': 'Temperature Indicator',
  'TIC': 'Temperature Indicating Controller',
  'TIT': 'Temperature Indicating Transmitter',
  'PI': 'Pressure Indicator',
  'PIC': 'Pressure Indicating Controller',
  'PIT': 'Pressure Indicating Transmitter',
  'LI': 'Level Indicator',
  'LIC': 'Level Indicating Controller',
  'LIT': 'Level Indicating Transmitter',
  'AI': 'Analyzer Indicator',
  'AIC': 'Analyzer Indicating Controller',
  'AIT': 'Analyzer Indicating Transmitter',
  'SI': 'Speed Indicator',
  'SIC': 'Speed Indicating Controller',
  'PIAH': 'Pressure Indicator Alarm High',
  'PIAL': 'Pressure Indicator Alarm Low',
  'LIAH': 'Level Indicator Alarm High',
  'LIAL': 'Level Indicator Alarm Low',
  'TIAH': 'Temperature Indicator Alarm High',
};

// 노이즈 필터링 (장비 태그와 혼동 방지)
const NOISE_TAGS = new Set(['PID', 'TIC', 'SIC']);

export function parseInstruments(pageTexts: PageTextRow[]): InstrumentData[] {
  const instrumentMap = new Map<string, InstrumentData>();

  for (const pt of pageTexts) {
    const text = pt.raw_text;
    const matches = [...text.matchAll(INSTRUMENT_REGEX)];

    for (const match of matches) {
      const functionLetters = match[1];
      const number = match[2];
      const tagNo = `${functionLetters}-${number}`;

      // 노이즈 필터링
      if (NOISE_TAGS.has(functionLetters)) continue;

      const functionType = FUNCTION_MAP[functionLetters] || `Instrument (${functionLetters})`;

      if (instrumentMap.has(tagNo)) {
        const existing = instrumentMap.get(tagNo)!;
        if (!existing.sourcePages.includes(pt.page_number)) {
          existing.sourcePages.push(pt.page_number);
        }
      } else {
        instrumentMap.set(tagNo, {
          tagNo,
          functionType,
          sourcePages: [pt.page_number],
        });
      }
    }
  }

  return [...instrumentMap.values()];
}

/**
 * 계장 데이터를 DB에 벌크 인서트
 */
export async function saveInstruments(
  projectId: string,
  instruments: InstrumentData[]
): Promise<number> {
  const supabase = createServiceClient();
  const BATCH_SIZE = 50;
  let inserted = 0;

  for (let i = 0; i < instruments.length; i += BATCH_SIZE) {
    const batch = instruments.slice(i, i + BATCH_SIZE).map((inst) => ({
      project_id: projectId,
      tag_no: inst.tagNo,
      function_type: inst.functionType,
      source_pages: inst.sourcePages,
    }));

    const { error } = await supabase.from('instruments').insert(batch);
    if (!error) inserted += batch.length;
  }

  return inserted;
}
