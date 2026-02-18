'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Layers, Package, Wrench } from 'lucide-react';

interface SearchResult {
  entityType: string;
  entityId: string;
  displayName: string;
  sourcePages: number[];
}

const ENTITY_ICONS: Record<string, typeof Layers> = {
  line: Layers,
  equipment: Wrench,
  package: Package,
};

const ENTITY_LABELS: Record<string, string> = {
  line: 'Line',
  equipment: 'Equipment',
  package: 'Package',
};

interface Props {
  projectId: string;
  onPageSelect: (page: number) => void;
}

export function ViewerSearch({ projectId, onPageSelect }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/projects/${projectId}/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
        setOpen(data.length > 0);
      }
      setLoading(false);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, projectId]);

  // 외부 클릭 시 닫기
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder="Search lines, equipment, packages..."
        className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary"
      />
      {loading && <div className="absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 animate-spin rounded-full border-2 border-primary border-t-transparent" />}

      {open && results.length > 0 && (
        <div className="absolute left-0 top-full z-50 mt-1 max-h-80 w-full overflow-y-auto rounded-lg border bg-popover shadow-lg">
          {results.map((r) => {
            const Icon = ENTITY_ICONS[r.entityType] || Layers;
            return (
              <div key={`${r.entityType}-${r.entityId}`} className="border-b last:border-0">
                <div className="flex items-center gap-2 px-3 py-2">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">{ENTITY_LABELS[r.entityType]}</span>
                  <span className="font-mono text-xs font-semibold">{r.displayName}</span>
                </div>
                {r.sourcePages.length > 0 && (
                  <div className="flex flex-wrap gap-1 px-3 pb-2">
                    {r.sourcePages.slice(0, 10).map((p) => (
                      <button
                        key={p}
                        onClick={() => { onPageSelect(p); setOpen(false); }}
                        className="rounded bg-muted px-1.5 py-0.5 text-xs hover:bg-primary hover:text-primary-foreground"
                      >
                        p.{p}
                      </button>
                    ))}
                    {r.sourcePages.length > 10 && (
                      <span className="self-center text-xs text-muted-foreground">+{r.sourcePages.length - 10}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
