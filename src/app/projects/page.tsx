'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog';
import type { ProjectWithStats } from '@/types';

export default function ProjectsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  async function loadProjects() {
    setLoading(true);
    const res = await fetch('/api/projects');
    if (res.ok) {
      setProjects(await res.json());
    }
    setLoading(false);
  }

  useEffect(() => { loadProjects(); }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* 헤더 */}
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold">PID-X</h1>
          <button
            onClick={handleLogout}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
          >
            로그아웃
          </button>
        </div>
      </header>

      {/* 메인 */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">프로젝트</h2>
          <button
            onClick={() => setShowCreate(true)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            + 새 프로젝트
          </button>
        </div>

        {/* 로딩 */}
        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-xl border bg-card" />
            ))}
          </div>
        )}

        {/* 빈 상태 */}
        {!loading && projects.length === 0 && (
          <div className="rounded-xl border bg-card py-16 text-center">
            <p className="text-lg font-medium text-muted-foreground">
              아직 프로젝트가 없습니다.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              첫 프로젝트를 생성해 보세요.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              프로젝트 생성
            </button>
          </div>
        )}

        {/* 프로젝트 카드 그리드 */}
        {!loading && projects.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => router.push(`/projects/${project.id}`)}
                className="cursor-pointer rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <h3 className="text-lg font-semibold">{project.name}</h3>
                {project.client && (
                  <p className="mt-1 text-sm text-muted-foreground">{project.client}</p>
                )}
                <div className="mt-4 flex gap-3">
                  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                    Lines {project.line_count.toLocaleString()}
                  </span>
                  <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                    Equip {project.equipment_count.toLocaleString()}
                  </span>
                  <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700">
                    Pkg {project.package_count.toLocaleString()}
                  </span>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {new Date(project.created_at).toLocaleDateString('ko-KR')}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 생성 다이얼로그 */}
      {showCreate && (
        <CreateProjectDialog
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            loadProjects();
          }}
        />
      )}
    </div>
  );
}
