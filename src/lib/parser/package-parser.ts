/**
 * T-019: Test Package 파서
 * PRD [FR-106]: 정확도 95%, 멀티라인 Regex
 */
import { createServiceClient } from '@/lib/supabase/server';
import type { TestMedium } from '@/types/database';

interface PageTextRow {
  id: string;
  page_number: number;
  raw_text: string;
}

export interface PackageData {
  packageNo: string;
  testPressure: string | null;
  testMedium: TestMedium;
  systemCode: string | null;
  sourcePage: number;
}

// Test Package 멀티라인 패턴
const PACKAGE_REGEX =
  /Package\s*no\.?\s*:?\s*([\w-]+)[\s\S]*?Test\s*Pressure\s*:?\s*([\d.]+\s*(?:Bar|barg|psig|kPa|NA)?)\s*[\s\S]*?Test\s*Medium\s*:?\s*([HVPS])/gi;

// 단순 패턴 (한 줄에 Package No만 있는 경우)
const PACKAGE_SIMPLE_REGEX =
  /Package\s*(?:no|#|number)\.?\s*:?\s*([\w]+-[\w]+-[\w]+)/gi;

// 시험 매체 패턴
const MEDIUM_REGEX = /Test\s*Medium\s*:?\s*([HVPS])/gi;

// 시험 압력 패턴
const PRESSURE_REGEX = /Test\s*Pressure\s*:?\s*([\d.]+\s*(?:Bar|barg|psig|kPa|NA)?)/gi;

const VALID_MEDIUMS = new Set(['H', 'V', 'P', 'S']);

export function parsePackages(pageTexts: PageTextRow[]): PackageData[] {
  const packageMap = new Map<string, PackageData>();

  for (const pt of pageTexts) {
    const text = pt.raw_text;

    // 1차: 멀티라인 패턴 매칭
    const multiMatches = [...text.matchAll(PACKAGE_REGEX)];
    for (const match of multiMatches) {
      const packageNo = match[1].trim();
      const pressure = match[2]?.trim() || null;
      const medium = match[3].toUpperCase() as TestMedium;

      if (!VALID_MEDIUMS.has(medium)) continue;

      // 시스템 코드: 패키지번호에서 파싱 (예: 2000E-P-0003 → P)
      const systemCode = extractSystemCode(packageNo);

      if (!packageMap.has(packageNo)) {
        packageMap.set(packageNo, {
          packageNo,
          testPressure: pressure,
          testMedium: medium,
          systemCode,
          sourcePage: pt.page_number,
        });
      }
    }

    // 2차: 단순 패턴 + 별도 매체/압력 추출
    if (multiMatches.length === 0) {
      const simpleMatches = [...text.matchAll(PACKAGE_SIMPLE_REGEX)];
      const mediumMatches = [...text.matchAll(MEDIUM_REGEX)];
      const pressureMatches = [...text.matchAll(PRESSURE_REGEX)];

      for (const match of simpleMatches) {
        const packageNo = match[1].trim();
        if (packageMap.has(packageNo)) continue;

        const medium = mediumMatches.length > 0
          ? mediumMatches[0][1].toUpperCase() as TestMedium
          : 'H'; // 기본값

        const pressure = pressureMatches.length > 0
          ? pressureMatches[0][1].trim()
          : null;

        if (!VALID_MEDIUMS.has(medium)) continue;

        packageMap.set(packageNo, {
          packageNo,
          testPressure: pressure,
          testMedium: medium,
          systemCode: extractSystemCode(packageNo),
          sourcePage: pt.page_number,
        });
      }
    }
  }

  return [...packageMap.values()];
}

function extractSystemCode(packageNo: string): string | null {
  // 패키지번호 예시: 2000E-P-0003 → 두 번째 세그먼트 "P"
  const parts = packageNo.split('-');
  if (parts.length >= 2) {
    const code = parts[1];
    if (code.length <= 3 && /^[A-Z]+$/.test(code)) {
      return code;
    }
  }
  return null;
}

/**
 * 패키지 데이터를 DB에 벌크 인서트
 */
export async function savePackages(
  projectId: string,
  packages: PackageData[]
): Promise<number> {
  const supabase = createServiceClient();
  const BATCH_SIZE = 50;
  let inserted = 0;

  for (let i = 0; i < packages.length; i += BATCH_SIZE) {
    const batch = packages.slice(i, i + BATCH_SIZE).map((pkg) => ({
      project_id: projectId,
      package_no: pkg.packageNo,
      system_code: pkg.systemCode,
      test_pressure: pkg.testPressure,
      test_medium: pkg.testMedium,
      source_page: pkg.sourcePage,
      status: 'draft' as const,
    }));

    const { error } = await supabase.from('test_packages').insert(batch);
    if (!error) inserted += batch.length;
  }

  return inserted;
}
