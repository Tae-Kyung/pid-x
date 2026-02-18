'use client';

import { useEffect, useState, useRef } from 'react';
import { Search, X } from 'lucide-react';

interface Props {
  projectId: string;
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  search: string;
  sizes: string[];
  services: string[];
}

export function LineListFilters({ projectId, onFilterChange }: Props) {
  const [search, setSearch] = useState('');
  const [sizes, setSizes] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // 필터 옵션 로드
  useEffect(() => {
    fetch(`/api/projects/${projectId}/lines/stats`)
      .then((r) => r.json())
      .then((data) => {
        setSizes(data.sizes || []);
        setServices(data.services || []);
      });
  }, [projectId]);

  // 디바운스 검색
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onFilterChange({ search, sizes: selectedSizes, services: selectedServices });
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search, selectedSizes, selectedServices]);

  function toggleFilter(arr: string[], val: string, setter: (v: string[]) => void) {
    setter(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  }

  function resetAll() {
    setSearch('');
    setSelectedSizes([]);
    setSelectedServices([]);
  }

  const hasFilters = search || selectedSizes.length > 0 || selectedServices.length > 0;

  return (
    <div className="space-y-3">
      {/* 검색 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="라인번호 검색..."
          className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* 필터 칩 */}
      <div className="flex flex-wrap gap-2">
        {/* 사이즈 필터 */}
        {sizes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            <span className="self-center text-xs font-medium text-muted-foreground mr-1">Size:</span>
            {sizes.slice(0, 15).map((s) => (
              <button
                key={s}
                onClick={() => toggleFilter(selectedSizes, s, setSelectedSizes)}
                className={`rounded-full px-2 py-0.5 text-xs transition-colors ${
                  selectedSizes.includes(s)
                    ? 'bg-blue-600 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* 서비스 필터 */}
        {services.length > 0 && (
          <div className="flex flex-wrap gap-1">
            <span className="self-center text-xs font-medium text-muted-foreground mr-1">Service:</span>
            {services.slice(0, 12).map((s) => (
              <button
                key={s}
                onClick={() => toggleFilter(selectedServices, s, setSelectedServices)}
                className={`rounded-full px-2 py-0.5 text-xs transition-colors ${
                  selectedServices.includes(s)
                    ? 'bg-green-600 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* 초기화 */}
        {hasFilters && (
          <button onClick={resetAll} className="flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive hover:bg-destructive/20">
            <X className="h-3 w-3" /> 초기화
          </button>
        )}
      </div>
    </div>
  );
}
