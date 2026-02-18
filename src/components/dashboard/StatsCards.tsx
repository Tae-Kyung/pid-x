'use client';

import { List, Wrench, Package, Gauge } from 'lucide-react';

interface Props {
  lines: number;
  equipment: number;
  packages: number;
  units: number;
  loading?: boolean;
}

const CARDS = [
  { key: 'lines', label: 'Lines', icon: List, color: 'text-blue-600 bg-blue-50' },
  { key: 'equipment', label: 'Equipment', icon: Wrench, color: 'text-green-600 bg-green-50' },
  { key: 'packages', label: 'Packages', icon: Package, color: 'text-orange-600 bg-orange-50' },
  { key: 'units', label: 'Units', icon: Gauge, color: 'text-purple-600 bg-purple-50' },
] as const;

export function StatsCards({ lines, equipment, packages, units, loading }: Props) {
  const values = { lines, equipment, packages, units };

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((c) => (
          <div key={c.key} className="h-24 animate-pulse rounded-xl border bg-card" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {CARDS.map((card) => (
        <div key={card.key} className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
            <div className={`rounded-lg p-2 ${card.color}`}>
              <card.icon className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-bold">{values[card.key].toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
