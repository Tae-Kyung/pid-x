'use client';

import { useEffect, useState } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  LayoutDashboard,
  List,
  Wrench,
  Package,
  Eye,
  FileSpreadsheet,
  Settings,
  Upload,
  ChevronLeft,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UnitTree } from '@/components/layout/UnitTree';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '', icon: LayoutDashboard },
  { label: 'Line List', href: '/lines', icon: List },
  { label: 'Equipment', href: '/equipment', icon: Wrench },
  { label: 'Packages', href: '/packages', icon: Package },
  { label: 'Viewer', href: '/viewer', icon: Eye },
  { label: 'Reports', href: '/reports', icon: FileSpreadsheet },
  { label: 'Upload', href: '/upload', icon: Upload },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const projectId = params.id as string;
  const [projectName, setProjectName] = useState('');

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/projects/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setProjectName(data.name);
      }
    }
    load();
  }, [projectId]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="flex min-h-screen">
      {/* 사이드바 */}
      <aside className="flex w-60 flex-col border-r bg-card">
        {/* 프로젝트 헤더 */}
        <div className="border-b p-4">
          <Link
            href="/projects"
            className="mb-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-3 w-3" />
            프로젝트 목록
          </Link>
          <h2 className="truncate text-sm font-semibold" title={projectName}>
            {projectName || '...'}
          </h2>
        </div>

        {/* 네비게이션 */}
        <nav className="flex-1 space-y-0.5 p-2">
          {NAV_ITEMS.map((item) => {
            const fullHref = `/projects/${projectId}${item.href}`;
            const isActive =
              item.href === ''
                ? pathname === fullHref
                : pathname.startsWith(fullHref);

            return (
              <Link
                key={item.href}
                href={fullHref}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* 유닛 트리 */}
        <UnitTree projectId={projectId} />

        {/* 하단 */}
        <div className="border-t p-2">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            로그아웃
          </button>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 overflow-auto bg-muted/30 p-6">{children}</main>
    </div>
  );
}
