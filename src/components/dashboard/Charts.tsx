'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

const MEDIUM_LABELS: Record<string, string> = {
  H: 'Hydrostatic',
  V: 'Vacuum',
  P: 'Pneumatic',
  S: 'Special',
};

interface ChartData {
  name: string;
  count: number;
}

// 사이즈별 Bar Chart
export function SizeChart({ data }: { data: ChartData[] }) {
  if (data.length === 0) return <EmptyChart label="사이즈 데이터 없음" />;
  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold">사이즈별 라인 수</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// 서비스별 Pie Chart
export function ServiceChart({ data }: { data: ChartData[] }) {
  if (data.length === 0) return <EmptyChart label="서비스 데이터 없음" />;
  const top8 = data.slice(0, 8);
  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold">서비스 코드별 분포</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={top8} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
            {top8.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// 시험매체별 Donut Chart
export function MediumChart({ data }: { data: ChartData[] }) {
  if (data.length === 0) return <EmptyChart label="시험매체 데이터 없음" />;
  const labeled = data.map((d) => ({ ...d, name: MEDIUM_LABELS[d.name] || d.name }));
  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold">시험매체별 분포</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={labeled} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100}>
            {labeled.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-[340px] items-center justify-center rounded-xl border bg-card">
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
