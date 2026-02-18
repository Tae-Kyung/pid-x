'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Package, Layers, Gem } from 'lucide-react';

interface PackageDetail {
  id: string;
  package_no: string;
  system_code: string | null;
  test_pressure: string | null;
  test_medium: string;
  status: string;
  source_page: number | null;
  created_at: string;
  lines: { id: string; line_number: string; nominal_size: string | null; service_code: string | null }[];
  golden_joints: { id: string; status: string; source_page: number | null; related_lines: string[] | null }[];
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  ready: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  approved: 'bg-purple-100 text-purple-700',
};

const GJ_STATUS_COLORS: Record<string, string> = {
  identified: 'bg-gray-100 text-gray-700',
  welding: 'bg-yellow-100 text-yellow-700',
  nde: 'bg-blue-100 text-blue-700',
  pwht: 'bg-orange-100 text-orange-700',
  approved: 'bg-green-100 text-green-700',
};

const MEDIUM_LABELS: Record<string, string> = { H: 'Hydro', V: 'Vacuum', P: 'Pneumatic', S: 'Special' };

export default function PackageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const pkgId = params.pkgId as string;

  const [pkg, setPkg] = useState<PackageDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/packages/${pkgId}`)
      .then((r) => r.json())
      .then((d) => { setPkg(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [projectId, pkgId]);

  async function updateStatus(status: string) {
    const res = await fetch(`/api/projects/${projectId}/packages/${pkgId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok && pkg) {
      setPkg({ ...pkg, status });
    }
  }

  async function updateGoldenJointStatus(gjId: string, status: string) {
    const res = await fetch(`/api/projects/${projectId}/golden-joints/${gjId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok && pkg) {
      setPkg({
        ...pkg,
        golden_joints: pkg.golden_joints.map((gj) =>
          gj.id === gjId ? { ...gj, status } : gj
        ),
      });
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-32 animate-pulse rounded-lg border bg-card" />
        <div className="h-48 animate-pulse rounded-lg border bg-card" />
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Package not found.</p>
        <button onClick={() => router.back()} className="mt-4 text-sm text-primary underline">Go back</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.push(`/projects/${projectId}/packages`)} className="rounded-md p-1 hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold font-mono">{pkg.package_no}</h1>
          <p className="text-sm text-muted-foreground">System: {pkg.system_code || 'Unknown'}</p>
        </div>
      </div>

      {/* Package Info Card */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold">Package Info</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <span className="text-xs text-muted-foreground">Test Medium</span>
            <p className="mt-1 text-sm font-medium">{MEDIUM_LABELS[pkg.test_medium] || pkg.test_medium}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Test Pressure</span>
            <p className="mt-1 text-sm font-medium">{pkg.test_pressure || '-'}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Source Page</span>
            <p className="mt-1 text-sm font-medium">{pkg.source_page || '-'}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Status</span>
            <div className="mt-1">
              <select
                value={pkg.status}
                onChange={(e) => updateStatus(e.target.value)}
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium border-0 ${STATUS_COLORS[pkg.status] || ''}`}
              >
                <option value="draft">Draft</option>
                <option value="ready">Ready</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="approved">Approved</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Included Lines */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold">Included Lines</h2>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{pkg.lines.length}</span>
        </div>
        {pkg.lines.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30">
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Line Number</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Size</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Service</th>
              </tr>
            </thead>
            <tbody>
              {pkg.lines.map((line) => (
                <tr key={line.id} className="border-t hover:bg-muted/20">
                  <td className="px-4 py-2 font-mono text-xs font-semibold">{line.line_number}</td>
                  <td className="px-4 py-2 text-xs">{line.nominal_size || '-'}</td>
                  <td className="px-4 py-2 text-xs">{line.service_code || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground">No lines linked to this package.</div>
        )}
      </div>

      {/* Golden Joints */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b">
          <Gem className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold">Golden Joints</h2>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{pkg.golden_joints.length}</span>
        </div>
        {pkg.golden_joints.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30">
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">#</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Related Lines</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Source Page</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {pkg.golden_joints.map((gj, idx) => (
                <tr key={gj.id} className="border-t hover:bg-muted/20">
                  <td className="px-4 py-2 text-xs text-muted-foreground">{idx + 1}</td>
                  <td className="px-4 py-2 font-mono text-xs">
                    {Array.isArray(gj.related_lines) && gj.related_lines.length > 0
                      ? gj.related_lines.join(', ')
                      : '-'}
                  </td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{gj.source_page || '-'}</td>
                  <td className="px-4 py-2">
                    <select
                      value={gj.status}
                      onChange={(e) => updateGoldenJointStatus(gj.id, e.target.value)}
                      className={`rounded-full px-2 py-0.5 text-xs font-medium border-0 ${GJ_STATUS_COLORS[gj.status] || ''}`}
                    >
                      <option value="identified">Identified</option>
                      <option value="welding">Welding</option>
                      <option value="nde">NDE</option>
                      <option value="pwht">PWHT</option>
                      <option value="approved">Approved</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground">No Golden Joints found for this package.</div>
        )}
      </div>
    </div>
  );
}
