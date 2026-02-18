'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { FolderTree, ChevronRight } from 'lucide-react';

interface UnitItem {
  code: string;
  name: string | null;
  lineCount: number;
  equipCount: number;
}

interface Props {
  projectId: string;
}

export function UnitTree({ projectId }: Props) {
  const [units, setUnits] = useState<UnitItem[]>([]);
  const [expanded, setExpanded] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const activeUnit = searchParams.get('unit') || '';

  useEffect(() => {
    fetch(`/api/projects/${projectId}/dashboard`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (data.unit_distribution) {
          setUnits(
            data.unit_distribution.map((u: { unit: string; name: string | null; lines: number; equipment: number }) => ({
              code: u.unit,
              name: u.name,
              lineCount: u.lines,
              equipCount: u.equipment,
            }))
          );
        }
      })
      .catch(() => {});
  }, [projectId]);

  function selectUnit(code: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (code === activeUnit) {
      params.delete('unit');
    } else {
      params.set('unit', code);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  if (units.length === 0) return null;

  return (
    <div className="border-t pt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <FolderTree className="h-3.5 w-3.5" />
        <span>Units</span>
        <ChevronRight className={`ml-auto h-3 w-3 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {expanded && (
        <div className="space-y-0.5 px-2 pb-2">
          <button
            onClick={() => { const p = new URLSearchParams(searchParams.toString()); p.delete('unit'); router.push(`${pathname}?${p.toString()}`); }}
            className={`w-full rounded px-3 py-1 text-left text-xs ${!activeUnit ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted'}`}
          >
            All Units
          </button>
          {units.map((u) => (
            <button
              key={u.code}
              onClick={() => selectUnit(u.code)}
              className={`w-full rounded px-3 py-1 text-left text-xs ${activeUnit === u.code ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted'}`}
            >
              {u.code} {u.name ? `- ${u.name}` : ''}
              <span className="ml-1 opacity-60">({u.lineCount}L)</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
