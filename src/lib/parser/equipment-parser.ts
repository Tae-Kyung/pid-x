/**
 * T-018: 장비 태그 파서
 * PRD [FR-105]: 정확도 85%, 장비 타입 분류 10종
 */
import { createServiceClient } from '@/lib/supabase/server';

interface PageTextRow {
  id: string;
  page_number: number;
  raw_text: string;
}

export interface EquipmentData {
  tagNo: string;
  equipType: string;
  sourcePages: number[];
}

// 장비 타입 분류 맵
const EQUIP_TYPE_MAP: Record<string, string> = {
  'V': 'Vessel',
  'E': 'Heat Exchanger',
  'P': 'Pump',
  'C': 'Compressor',
  'T': 'Tower',
  'D': 'Drum',
  'F': 'Furnace',
  'R': 'Reactor',
  'AE': 'Air Exchanger',
  'AD': 'Air Dryer',
  'AG': 'Agitator',
  'BL': 'Blower',
  'EJ': 'Ejector',
  'FI': 'Filter',
  'HT': 'Heater',
  'MX': 'Mixer',
  'ST': 'Stack',
  'TK': 'Tank',
};

// 장비 태그 Regex: PREFIX-NUMBER[SUFFIX]
const EQUIP_REGEX = /\b([A-Z]{1,3})-(\d{4,5}[A-Z]?(?:\/[A-Z])?)\b/g;

// 노이즈 패턴 (장비 태그가 아닌 것)
const NOISE_PREFIXES = new Set([
  'PID', 'DWG', 'REV', 'REF', 'ISO', 'TAG', 'SHT', 'CHT', 'PRC',
  'DRG', 'DOC', 'JOB', 'PKG', 'SYS', 'GEN', 'ENG', 'PRO',
]);

export function parseEquipment(pageTexts: PageTextRow[]): EquipmentData[] {
  const equipMap = new Map<string, EquipmentData>();

  for (const pt of pageTexts) {
    const text = pt.raw_text;
    const matches = [...text.matchAll(EQUIP_REGEX)];

    for (const match of matches) {
      const prefix = match[1];
      const number = match[2];
      const tagNo = `${prefix}-${number}`;

      // 노이즈 필터링
      if (NOISE_PREFIXES.has(prefix)) continue;
      if (prefix.length > 2 && !EQUIP_TYPE_MAP[prefix]) continue;

      // 장비 타입 결정
      const equipType = EQUIP_TYPE_MAP[prefix] || `Unknown (${prefix})`;

      if (equipMap.has(tagNo)) {
        const existing = equipMap.get(tagNo)!;
        if (!existing.sourcePages.includes(pt.page_number)) {
          existing.sourcePages.push(pt.page_number);
        }
      } else {
        equipMap.set(tagNo, {
          tagNo,
          equipType,
          sourcePages: [pt.page_number],
        });
      }
    }
  }

  return [...equipMap.values()];
}

/**
 * 장비 데이터를 DB에 벌크 인서트
 */
export async function saveEquipment(
  projectId: string,
  equipment: EquipmentData[]
): Promise<number> {
  const supabase = createServiceClient();
  const BATCH_SIZE = 50;
  let inserted = 0;

  for (let i = 0; i < equipment.length; i += BATCH_SIZE) {
    const batch = equipment.slice(i, i + BATCH_SIZE).map((eq) => ({
      project_id: projectId,
      tag_no: eq.tagNo,
      equip_type: eq.equipType,
      source_pages: eq.sourcePages,
    }));

    const { error } = await supabase
      .from('equipment')
      .upsert(batch, { onConflict: 'project_id,tag_no', ignoreDuplicates: true });

    if (!error) inserted += batch.length;
  }

  return inserted;
}
