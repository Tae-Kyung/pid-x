'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { SizeChart, ServiceChart, MediumChart } from '@/components/dashboard/Charts';
import { UnitSummary } from '@/components/dashboard/UnitSummary';
import type { DashboardStats } from '@/types';

export default function DashboardPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/projects/${projectId}/dashboard`);
      if (res.ok) setStats(await res.json());
      setLoading(false);
    }
    load();
  }, [projectId]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* 통계 카드 */}
      <StatsCards
        lines={stats?.total_lines ?? 0}
        equipment={stats?.total_equipment ?? 0}
        packages={stats?.total_packages ?? 0}
        units={stats?.total_units ?? 0}
        loading={loading}
      />

      {/* 데이터 없을 때 안내 */}
      {!loading && stats && stats.total_lines === 0 && (
        <div className="rounded-xl border bg-card py-12 text-center">
          <p className="text-muted-foreground">
            아직 추출된 데이터가 없습니다. PDF를 업로드해 주세요.
          </p>
        </div>
      )}

      {/* 차트 */}
      {!loading && stats && stats.total_lines > 0 && (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <SizeChart data={stats.size_distribution} />
            <ServiceChart data={stats.service_distribution} />
          </div>

          {stats.total_packages > 0 && (
            <div className="grid gap-4 lg:grid-cols-2">
              <MediumChart data={stats.medium_distribution} />
              <UnitSummary data={stats.unit_distribution} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
