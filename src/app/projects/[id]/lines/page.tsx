'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { type SortingState } from '@tanstack/react-table';
import { LineListTable } from '@/components/line-list/LineListTable';
import { LineListFilters, type FilterState } from '@/components/line-list/LineListFilters';

interface PipeLine {
  id: string;
  line_number: string;
  nominal_size: string | null;
  service_code: string | null;
  spec_class: string | null;
  source_pages: number[];
  status: string;
}

export default function LinesPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [data, setData] = useState<PipeLine[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filters, setFilters] = useState<FilterState>({ search: '', sizes: [], services: [] });
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (sorting.length > 0) {
      params.set('sort', sorting[0].id);
      params.set('order', sorting[0].desc ? 'desc' : 'asc');
    }
    if (filters.search) params.set('search', filters.search);
    filters.sizes.forEach((s) => params.append('size', s));
    filters.services.forEach((s) => params.append('service', s));

    const res = await fetch(`/api/projects/${projectId}/lines?${params}`);
    if (res.ok) {
      const json = await res.json();
      setData(json.items);
      setTotal(json.total);
    }
    setLoading(false);
  }, [projectId, page, limit, sorting, filters]);

  useEffect(() => { loadData(); }, [loadData]);

  // 필터 변경 시 1페이지로 리셋
  function handleFilterChange(f: FilterState) {
    setFilters(f);
    setPage(1);
    setSelectedIds(new Set());
  }

  // 인라인 편집
  async function handleUpdate(id: string, field: string, value: string) {
    await fetch(`/api/projects/${projectId}/lines/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    });
    loadData();
  }

  // 벌크 편집
  async function handleBulkAction(status: string) {
    if (selectedIds.size === 0) return;
    await fetch(`/api/projects/${projectId}/lines`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [...selectedIds], updates: { status } }),
    });
    setSelectedIds(new Set());
    loadData();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Line List</h1>
        {total > 0 && (
          <span className="text-sm text-muted-foreground">총 {total.toLocaleString()} 라인</span>
        )}
      </div>

      <LineListFilters projectId={projectId} onFilterChange={handleFilterChange} />

      {/* 벌크 액션 바 */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border bg-primary/5 px-4 py-2">
          <span className="text-sm font-medium">{selectedIds.size}개 선택됨</span>
          <button onClick={() => handleBulkAction('verified')} className="rounded bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700">
            Verified 처리
          </button>
          <button onClick={() => handleBulkAction('extracted')} className="rounded bg-gray-500 px-3 py-1 text-xs font-medium text-white hover:bg-gray-600">
            Extracted 복원
          </button>
          <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-xs text-muted-foreground hover:underline">
            선택 해제
          </button>
        </div>
      )}

      {loading && data.length === 0 ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded border bg-card" />
          ))}
        </div>
      ) : (
        <LineListTable
          data={data}
          total={total}
          page={page}
          limit={limit}
          sorting={sorting}
          onSortingChange={setSorting}
          onPageChange={setPage}
          onLimitChange={(l) => { setLimit(l); setPage(1); }}
          onUpdate={handleUpdate}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      )}
    </div>
  );
}
