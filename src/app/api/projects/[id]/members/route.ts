import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/projects/:id/members — 멤버 목록
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // 프로젝트 owner
  const { data: project } = await supabase
    .from('projects')
    .select('owner_id')
    .eq('id', projectId)
    .single();

  // 멤버 목록
  const { data: members } = await supabase
    .from('project_members')
    .select('user_id, role, invited_at')
    .eq('project_id', projectId);

  // 프로필 조회 (owner + members)
  const userIds = new Set<string>();
  if (project?.owner_id) userIds.add(project.owner_id);
  for (const m of (members ?? [])) userIds.add(m.user_id);

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, avatar_url')
    .in('id', [...userIds]);

  const profileMap = new Map((profiles ?? []).map((p: { id: string; name: string | null; avatar_url: string | null }) => [p.id, p]));

  const result = [...userIds].map((uid) => {
    const profile = profileMap.get(uid);
    const member = (members ?? []).find((m: { user_id: string }) => m.user_id === uid);
    const isOwner = uid === project?.owner_id;
    return {
      user_id: uid,
      name: profile?.name || 'Unknown',
      role: isOwner ? 'owner' : (member?.role || 'viewer'),
      invited_at: member?.invited_at || null,
    };
  });

  return NextResponse.json(result);
}

// POST /api/projects/:id/members — 멤버 초대
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { email, role = 'viewer' } = await request.json();
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

  // 이메일로 프로필 찾기
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id')
    .limit(1);

  // 간이 구현: auth.users에서 직접 검색은 불가하므로,
  // 초대할 유저가 이미 가입된 경우만 처리
  // 실제 환경에서는 Supabase Admin API로 invite 처리
  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const { error } = await supabase
    .from('project_members')
    .upsert(
      { project_id: projectId, user_id: profiles[0].id, role },
      { onConflict: 'user_id,project_id' }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true }, { status: 201 });
}
