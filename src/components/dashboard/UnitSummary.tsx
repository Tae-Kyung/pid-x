'use client';

interface UnitRow {
  unit: string;
  name: string | null;
  lines: number;
  equipment: number;
}

export function UnitSummary({ data }: { data: UnitRow[] }) {
  if (data.length === 0) return null;

  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold">유닛별 요약</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 font-medium">Unit</th>
            <th className="pb-2 font-medium">Name</th>
            <th className="pb-2 text-right font-medium">Lines</th>
            <th className="pb-2 text-right font-medium">Equipment</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.unit} className="border-b last:border-0">
              <td className="py-2 font-mono text-xs font-semibold">{row.unit}</td>
              <td className="py-2 text-muted-foreground">{row.name || '-'}</td>
              <td className="py-2 text-right">{row.lines.toLocaleString()}</td>
              <td className="py-2 text-right">{row.equipment.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
