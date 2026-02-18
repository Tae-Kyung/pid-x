'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface Package {
  id: string;
  package_no: string;
  system_code: string | null;
  test_pressure: string | null;
  test_medium: string;
  status: string;
  source_page: number | null;
}

interface Stats {
  total: number;
  completed: number;
  systems: { name: string; total: number; completed: number }[];
  mediums: { name: string; count: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  ready: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  approved: 'bg-purple-100 text-purple-700',
};

const MEDIUM_LABELS: Record<string, string> = { H: 'Hydro', V: 'Vacuum', P: 'Pneumatic', S: 'Special' };

export default function PackagesPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [packages, setPackages] = useState<Package[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSystems, setExpandedSystems] = useState<Set<string>>(new Set());

  useEffect(() => {
    Promise.all([
      fetch(`/api/projects/${projectId}/packages`).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      }),
      fetch(`/api/projects/${projectId}/packages/stats`).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      }),
    ]).then(([pkgs, s]) => {
      setPackages(pkgs);
      setStats(s);
      // 첫 3개 시스템 자동 펼치기
      const first3 = (s.systems || []).slice(0, 3).map((sys: { name: string }) => sys.name);
      setExpandedSystems(new Set(first3));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [projectId]);

  // 시스템별 그룹핑
  const grouped = new Map<string, Package[]>();
  for (const pkg of packages) {
    const sys = pkg.system_code || 'Unknown';
    if (!grouped.has(sys)) grouped.set(sys, []);
    grouped.get(sys)!.push(pkg);
  }

  function toggleSystem(sys: string) {
    setExpandedSystems((prev) => {
      const next = new Set(prev);
      if (next.has(sys)) next.delete(sys);
      else next.add(sys);
      return next;
    });
  }

  async function updateStatus(pkgId: string, status: string) {
    await fetch(`/api/projects/${projectId}/packages/${pkgId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    // 새로고침
    const res = await fetch(`/api/projects/${projectId}/packages`);
    if (res.ok) setPackages(await res.json());
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Test Packages</h1>
        {[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-lg border bg-card" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Test Packages</h1>
        {stats && <span className="text-sm text-muted-foreground">총 {stats.total.toLocaleString()}개</span>}
      </div>

      {/* 진도 바 */}
      {stats && stats.total > 0 && (
        <div className="rounded-xl border bg-card p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">전체 진도</span>
            <span className="text-muted-foreground">{stats.completed}/{stats.total} ({Math.round(stats.completed / stats.total * 100)}%)</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${(stats.completed / stats.total) * 100}%` }} />
          </div>
        </div>
      )}

      {/* 패키지 없을 때 */}
      {packages.length === 0 && (
        <div className="rounded-xl border bg-card py-12 text-center">
          <p className="text-muted-foreground">추출된 Test Package가 없습니다.</p>
        </div>
      )}

      {/* 시스템별 그룹 */}
      {[...grouped.entries()].map(([system, pkgs]) => {
        const isExpanded = expandedSystems.has(system);
        const completedCount = pkgs.filter((p) => p.status === 'completed' || p.status === 'approved').length;

        return (
          <div key={system} className="rounded-xl border bg-card overflow-hidden">
            {/* 그룹 헤더 */}
            <button
              onClick={() => toggleSystem(system)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/50"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <span className="font-semibold">System: {system}</span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{pkgs.length}</span>
              <div className="ml-auto flex items-center gap-2">
                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-green-500" style={{ width: `${pkgs.length > 0 ? (completedCount / pkgs.length) * 100 : 0}%` }} />
                </div>
                <span className="text-xs text-muted-foreground">{completedCount}/{pkgs.length}</span>
              </div>
            </button>

            {/* 패키지 목록 */}
            {isExpanded && (
              <div className="border-t">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30">
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Package No</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Pressure</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Medium</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Page</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pkgs.map((pkg) => (
                      <tr key={pkg.id} className="border-t hover:bg-muted/20 cursor-pointer" onClick={() => router.push(`/projects/${projectId}/packages/${pkg.id}`)}>
                        <td className="px-4 py-2 font-mono text-xs font-semibold">{pkg.package_no}</td>
                        <td className="px-4 py-2 text-xs">{pkg.test_pressure || '-'}</td>
                        <td className="px-4 py-2">
                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{MEDIUM_LABELS[pkg.test_medium] || pkg.test_medium}</span>
                        </td>
                        <td className="px-4 py-2">
                          <select
                            value={pkg.status}
                            onChange={(e) => { e.stopPropagation(); updateStatus(pkg.id, e.target.value); }}
                            onClick={(e) => e.stopPropagation()}
                            className={`rounded-full px-2 py-0.5 text-xs font-medium border-0 ${STATUS_COLORS[pkg.status] || ''}`}
                          >
                            <option value="draft">Draft</option>
                            <option value="ready">Ready</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="approved">Approved</option>
                          </select>
                        </td>
                        <td className="px-4 py-2 text-xs text-muted-foreground">{pkg.source_page || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
