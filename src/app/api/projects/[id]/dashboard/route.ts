import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/projects/:id/dashboard — 프로젝트 통계
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // 병렬 집계 쿼리
  const [
    linesRes,
    equipRes,
    pkgRes,
    instrRes,
    drawingsRes,
    unitsRes,
    sizeRes,
    serviceRes,
    mediumRes,
    pkgStatusRes,
    unitStatsRes,
  ] = await Promise.all([
    supabase.from('pipe_lines').select('id', { count: 'exact', head: true }).eq('project_id', projectId),
    supabase.from('equipment').select('id', { count: 'exact', head: true }).eq('project_id', projectId),
    supabase.from('test_packages').select('id', { count: 'exact', head: true }).eq('project_id', projectId),
    supabase.from('instruments').select('id', { count: 'exact', head: true }).eq('project_id', projectId),
    supabase.from('drawings').select('id, unit_id!inner(project_id)', { count: 'exact', head: true }),
    supabase.from('units').select('id', { count: 'exact', head: true }).eq('project_id', projectId),
    // 사이즈별 분포
    supabase.from('pipe_lines').select('nominal_size').eq('project_id', projectId),
    // 서비스별 분포
    supabase.from('pipe_lines').select('service_code').eq('project_id', projectId),
    // 매체별 분포
    supabase.from('test_packages').select('test_medium').eq('project_id', projectId),
    // 패키지 상태별
    supabase.from('test_packages').select('status').eq('project_id', projectId),
    // 유닛별 통계
    supabase.from('units').select('id, code, name').eq('project_id', projectId),
  ]);

  // 사이즈 분포 집계
  const sizeDistribution = aggregateField(
    (sizeRes.data as { nominal_size: string }[] | null) ?? [],
    'nominal_size'
  ).sort((a, b) => {
    const aNum = parseFloat(a.name.replace('"', ''));
    const bNum = parseFloat(b.name.replace('"', ''));
    return aNum - bNum;
  });

  // 서비스 분포 집계
  const serviceDistribution = aggregateField(
    (serviceRes.data as { service_code: string }[] | null) ?? [],
    'service_code'
  ).sort((a, b) => b.count - a.count);

  // 매체 분포 집계
  const mediumDistribution = aggregateField(
    (mediumRes.data as { test_medium: string }[] | null) ?? [],
    'test_medium'
  );

  // 패키지 상태 분포 집계
  const packageStatusDistribution = aggregateField(
    (pkgStatusRes.data as { status: string }[] | null) ?? [],
    'status'
  );

  // 유닛별 통계 (각 유닛의 라인/장비/패키지 수)
  const units = (unitStatsRes.data ?? []) as { id: string; code: string; name: string | null }[];
  const unitDistribution = await Promise.all(
    units.map(async (unit) => {
      const [ul, ue] = await Promise.all([
        supabase.from('pipe_lines').select('id', { count: 'exact', head: true }).eq('project_id', projectId).eq('unit_id', unit.id),
        supabase.from('equipment').select('id', { count: 'exact', head: true }).eq('project_id', projectId).eq('unit_id', unit.id),
      ]);
      return {
        unit: unit.code,
        name: unit.name,
        lines: ul.count ?? 0,
        equipment: ue.count ?? 0,
      };
    })
  );

  return NextResponse.json({
    total_lines: linesRes.count ?? 0,
    total_equipment: equipRes.count ?? 0,
    total_packages: pkgRes.count ?? 0,
    total_instruments: instrRes.count ?? 0,
    total_drawings: drawingsRes.count ?? 0,
    total_units: unitsRes.count ?? 0,
    size_distribution: sizeDistribution,
    service_distribution: serviceDistribution,
    medium_distribution: mediumDistribution,
    package_status_distribution: packageStatusDistribution,
    unit_distribution: unitDistribution,
  });
}

function aggregateField<T extends Record<string, unknown>>(
  rows: T[],
  field: keyof T
): { name: string; count: number }[] {
  const map = new Map<string, number>();
  for (const row of rows) {
    const val = String(row[field] ?? 'Unknown');
    map.set(val, (map.get(val) ?? 0) + 1);
  }
  return [...map.entries()].map(([name, count]) => ({ name, count }));
}
