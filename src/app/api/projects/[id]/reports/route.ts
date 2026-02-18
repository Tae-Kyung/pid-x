import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import {
  createWorkbook,
  applyHeaderStyle,
  autoColumnWidth,
  applyFilter,
  applyDataBorders,
  highlightLargeSize,
} from '@/lib/report/excel-generator';

// POST /api/projects/:id/reports — 엑셀 보고서 생성 + 다운로드
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = createServiceClient();

  const { type } = await request.json();

  const wb = createWorkbook();

  if (type === 'line-list') {
    await generateLineList(wb, db, projectId);
  } else if (type === 'equipment') {
    await generateEquipment(wb, db, projectId);
  } else if (type === 'packages') {
    await generatePackages(wb, db, projectId);
  } else if (type === 'summary') {
    await generateSummary(wb, db, projectId);
  } else {
    return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
  }

  // 엑셀 Buffer 생성
  const buffer = await wb.xlsx.writeBuffer();

  // 파일명
  const filename = `PID-X_${type}_${new Date().toISOString().slice(0, 10)}.xlsx`;

  return new Response(buffer as ArrayBuffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generateLineList(wb: any, supabase: any, projectId: string) {
  // Sheet 1: Line List
  const { data: lines } = await supabase
    .from('pipe_lines')
    .select('line_number, nominal_size, service_code, spec_class, source_pages, status')
    .eq('project_id', projectId)
    .order('line_number');

  const ws = wb.addWorksheet('Line List');
  ws.addRow(['Line Number', 'Nominal Size', 'Service Code', 'Spec Class', 'Source Pages', 'Status']);
  applyHeaderStyle(ws);

  for (const line of (lines ?? [])) {
    const pages = Array.isArray(line.source_pages) ? line.source_pages.join(', ') : '';
    ws.addRow([line.line_number, line.nominal_size || '', line.service_code || '', line.spec_class || '', pages, line.status || '']);
  }

  autoColumnWidth(ws);
  applyFilter(ws);
  applyDataBorders(ws);
  highlightLargeSize(ws, 2); // 2nd column = Nominal Size

  // Sheet 2: Summary
  const ws2 = wb.addWorksheet('Summary');
  ws2.addRow(['Category', 'Value', 'Count']);
  applyHeaderStyle(ws2);

  const sizeMap = new Map<string, number>();
  const serviceMap = new Map<string, number>();
  for (const line of (lines ?? [])) {
    const size = line.nominal_size || 'Unknown';
    sizeMap.set(size, (sizeMap.get(size) ?? 0) + 1);
    const svc = line.service_code || 'Unknown';
    serviceMap.set(svc, (serviceMap.get(svc) ?? 0) + 1);
  }

  for (const [size, count] of [...sizeMap.entries()].sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))) {
    ws2.addRow(['Size', size, count]);
  }
  ws2.addRow([]);
  for (const [svc, count] of [...serviceMap.entries()].sort((a, b) => b[1] - a[1])) {
    ws2.addRow(['Service', svc, count]);
  }
  autoColumnWidth(ws2);
  applyDataBorders(ws2);

  // Sheet 3: Filter Info
  const ws3 = wb.addWorksheet('Filter Info');
  ws3.addRow(['Property', 'Value']);
  applyHeaderStyle(ws3);
  ws3.addRow(['Report Type', 'Line List']);
  ws3.addRow(['Generated At', new Date().toISOString()]);
  ws3.addRow(['Total Lines', (lines ?? []).length]);
  ws3.addRow(['Filter', 'None (All Lines)']);
  autoColumnWidth(ws3);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generateEquipment(wb: any, supabase: any, projectId: string) {
  const { data: equipment } = await supabase
    .from('equipment')
    .select('tag_no, equip_type, source_pages')
    .eq('project_id', projectId)
    .order('tag_no');

  const ws = wb.addWorksheet('Equipment List');
  ws.addRow(['Tag No', 'Equipment Type', 'Source Pages']);
  applyHeaderStyle(ws);

  for (const eq of (equipment ?? [])) {
    const pages = Array.isArray(eq.source_pages) ? eq.source_pages.join(', ') : '';
    ws.addRow([eq.tag_no, eq.equip_type || '', pages]);
  }

  autoColumnWidth(ws);
  applyFilter(ws);
  applyDataBorders(ws);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generatePackages(wb: any, supabase: any, projectId: string) {
  const MEDIUM_LABELS: Record<string, string> = { H: 'Hydro', V: 'Vacuum', P: 'Pneumatic', S: 'Special' };

  // Sheet 1: Packages
  const { data: packages } = await supabase
    .from('test_packages')
    .select('package_no, system_code, test_pressure, test_medium, status, source_page')
    .eq('project_id', projectId)
    .order('system_code')
    .order('package_no');

  const ws = wb.addWorksheet('Packages');
  ws.addRow(['Package No', 'System Code', 'Test Pressure', 'Test Medium', 'Status', 'Source Page']);
  applyHeaderStyle(ws);

  for (const pkg of (packages ?? [])) {
    ws.addRow([
      pkg.package_no,
      pkg.system_code || '',
      pkg.test_pressure || '',
      MEDIUM_LABELS[pkg.test_medium] || pkg.test_medium,
      pkg.status || '',
      pkg.source_page || '',
    ]);
  }

  autoColumnWidth(ws);
  applyFilter(ws);
  applyDataBorders(ws);

  // Sheet 2: System Summary
  const ws2 = wb.addWorksheet('System Summary');
  ws2.addRow(['System Code', 'Total', 'Completed', 'Progress']);
  applyHeaderStyle(ws2);

  const systemMap = new Map<string, { total: number; completed: number }>();
  for (const pkg of (packages ?? [])) {
    const sys = pkg.system_code || 'Unknown';
    const s = systemMap.get(sys) || { total: 0, completed: 0 };
    s.total++;
    if (pkg.status === 'completed' || pkg.status === 'approved') s.completed++;
    systemMap.set(sys, s);
  }

  for (const [sys, v] of systemMap.entries()) {
    ws2.addRow([sys, v.total, v.completed, `${v.total > 0 ? Math.round((v.completed / v.total) * 100) : 0}%`]);
  }
  autoColumnWidth(ws2);
  applyDataBorders(ws2);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generateSummary(wb: any, supabase: any, projectId: string) {
  const [linesRes, equipRes, pkgRes] = await Promise.all([
    supabase.from('pipe_lines').select('nominal_size, service_code').eq('project_id', projectId),
    supabase.from('equipment').select('equip_type').eq('project_id', projectId),
    supabase.from('test_packages').select('test_medium, status').eq('project_id', projectId),
  ]);

  const lines = linesRes.data ?? [];
  const equipment = equipRes.data ?? [];
  const packages = pkgRes.data ?? [];

  // Sheet 1: Overview
  const ws = wb.addWorksheet('Overview');
  ws.addRow(['Category', 'Count']);
  applyHeaderStyle(ws);
  ws.addRow(['Total Lines', lines.length]);
  ws.addRow(['Total Equipment', equipment.length]);
  ws.addRow(['Total Test Packages', packages.length]);
  autoColumnWidth(ws);
  applyDataBorders(ws);

  // Sheet 2: Size Distribution
  const ws2 = wb.addWorksheet('Size Distribution');
  ws2.addRow(['Nominal Size', 'Count']);
  applyHeaderStyle(ws2);

  const sizeMap = new Map<string, number>();
  for (const l of lines) {
    const size = l.nominal_size || 'Unknown';
    sizeMap.set(size, (sizeMap.get(size) ?? 0) + 1);
  }
  for (const [size, count] of [...sizeMap.entries()].sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))) {
    ws2.addRow([size, count]);
  }
  autoColumnWidth(ws2);
  applyDataBorders(ws2);

  // Sheet 3: Service Distribution
  const ws3 = wb.addWorksheet('Service Distribution');
  ws3.addRow(['Service Code', 'Count']);
  applyHeaderStyle(ws3);

  const svcMap = new Map<string, number>();
  for (const l of lines) {
    const svc = l.service_code || 'Unknown';
    svcMap.set(svc, (svcMap.get(svc) ?? 0) + 1);
  }
  for (const [svc, count] of [...svcMap.entries()].sort((a, b) => b[1] - a[1])) {
    ws3.addRow([svc, count]);
  }
  autoColumnWidth(ws3);
  applyDataBorders(ws3);

  // Sheet 4: Equipment Types
  const ws4 = wb.addWorksheet('Equipment Types');
  ws4.addRow(['Equipment Type', 'Count']);
  applyHeaderStyle(ws4);

  const typeMap = new Map<string, number>();
  for (const eq of equipment) {
    const t = eq.equip_type || 'Unknown';
    typeMap.set(t, (typeMap.get(t) ?? 0) + 1);
  }
  for (const [t, count] of [...typeMap.entries()].sort((a, b) => b[1] - a[1])) {
    ws4.addRow([t, count]);
  }
  autoColumnWidth(ws4);
  applyDataBorders(ws4);
}
