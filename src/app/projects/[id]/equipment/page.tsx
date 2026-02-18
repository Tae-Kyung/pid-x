'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface Equipment {
  id: string;
  tag_no: string;
  equip_type: string | null;
  source_pages: number[];
}

interface TypeStat {
  name: string;
  count: number;
}

export default function EquipmentPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [data, setData] = useState<Equipment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [search, setSearch] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [typeStats, setTypeStats] = useState<TypeStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/equipment/stats`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => setTypeStats(d.types || []))
      .catch(() => {});
  }, [projectId]);

  const loadData = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams();
    p.set('page', String(page));
    p.set('limit', String(limit));
    if (search) p.set('search', search);
    selectedTypes.forEach((t) => p.append('type', t));

    const res = await fetch(`/api/projects/${projectId}/equipment?${p}`);
    if (res.ok) {
      const json = await res.json();
      setData(json.items);
      setTotal(json.total);
    }
    setLoading(false);
  }, [projectId, page, limit, search, selectedTypes]);

  useEffect(() => { loadData(); }, [loadData]);

  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  function toggleType(type: string) {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
    setPage(1);
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Equipment</h1>
        {total > 0 && <span className="text-sm text-muted-foreground">총 {total.toLocaleString()}개</span>}
      </div>

      {typeStats.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {typeStats.map((ts) => (
            <button
              key={ts.name}
              onClick={() => toggleType(ts.name)}
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                selectedTypes.includes(ts.name)
                  ? 'bg-green-600 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {ts.name} ({ts.count.toLocaleString()})
            </button>
          ))}
        </div>
      )}

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="장비 태그 검색..."
          className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Tag No</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Type</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Source Pages</th>
            </tr>
          </thead>
          <tbody>
            {data.map((eq) => (
              <tr key={eq.id} className="border-b hover:bg-muted/30">
                <td className="px-3 py-2 font-mono text-xs font-semibold">{eq.tag_no}</td>
                <td className="px-3 py-2">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{eq.equip_type || '-'}</span>
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground">
                  {Array.isArray(eq.source_pages) && eq.source_pages.length > 0
                    ? eq.source_pages.slice(0, 5).join(', ') + (eq.source_pages.length > 5 ? ` +${eq.source_pages.length - 5}` : '')
                    : '-'}
                </td>
              </tr>
            ))}
            {!loading && data.length === 0 && (
              <tr><td colSpan={3} className="py-8 text-center text-sm text-muted-foreground">데이터가 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">페이지당</span>
          <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} className="rounded border bg-background px-2 py-1 text-xs">
            {[50, 100, 200, 500].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage(page - 1)} disabled={page <= 1} className="rounded border p-1 hover:bg-muted disabled:opacity-30">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-3 text-xs">{page} / {totalPages || 1}</span>
          <button onClick={() => setPage(page + 1)} disabled={page >= totalPages} className="rounded border p-1 hover:bg-muted disabled:opacity-30">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
