import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/projects — 프로젝트 목록
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // RLS가 자동으로 사용자의 프로젝트만 반환
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 각 프로젝트별 통계 조회
  const projectsWithStats = await Promise.all(
    (projects ?? []).map(async (project) => {
      const [lines, equipment, packages] = await Promise.all([
        supabase.from('pipe_lines').select('id', { count: 'exact', head: true }).eq('project_id', project.id),
        supabase.from('equipment').select('id', { count: 'exact', head: true }).eq('project_id', project.id),
        supabase.from('test_packages').select('id', { count: 'exact', head: true }).eq('project_id', project.id),
      ]);
      return {
        ...project,
        line_count: lines.count ?? 0,
        equipment_count: equipment.count ?? 0,
        package_count: packages.count ?? 0,
      };
    })
  );

  return NextResponse.json(projectsWithStats);
}

// POST /api/projects — 프로젝트 생성
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { name, description, client } = body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: '프로젝트명은 필수입니다.' }, { status: 400 });
  }

  // 프로젝트 생성
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({ name: name.trim(), description, client, owner_id: user.id })
    .select()
    .single();

  if (projectError) return NextResponse.json({ error: projectError.message }, { status: 500 });

  // owner를 admin 멤버로 자동 추가
  await supabase.from('project_members').insert({
    user_id: user.id,
    project_id: project.id,
    role: 'admin',
  });

  return NextResponse.json(project, { status: 201 });
}
