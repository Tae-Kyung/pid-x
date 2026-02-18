'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { UserPlus, Trash2 } from 'lucide-react';

interface Member {
  user_id: string;
  name: string;
  role: string;
  invited_at: string | null;
}

const ROLE_COLORS: Record<string, string> = {
  owner: 'bg-yellow-100 text-yellow-800',
  admin: 'bg-purple-100 text-purple-700',
  editor: 'bg-blue-100 text-blue-700',
  viewer: 'bg-gray-100 text-gray-700',
};

export default function SettingsPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    loadMembers();
  }, [projectId]);

  async function loadMembers() {
    const res = await fetch(`/api/projects/${projectId}/members`);
    if (res.ok) setMembers(await res.json());
    setLoading(false);
  }

  async function inviteMember() {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    await fetch(`/api/projects/${projectId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
    });
    setInviteEmail('');
    await loadMembers();
    setInviting(false);
  }

  async function changeRole(userId: string, role: string) {
    await fetch(`/api/projects/${projectId}/members/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    await loadMembers();
  }

  async function removeMember(userId: string) {
    if (!confirm('이 멤버를 제거하시겠습니까?')) return;
    await fetch(`/api/projects/${projectId}/members/${userId}`, { method: 'DELETE' });
    await loadMembers();
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Team Members */}
      <div className="rounded-xl border bg-card">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-semibold">Team Members</h2>
          <span className="text-xs text-muted-foreground">{members.length} members</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>
        ) : (
          <div className="divide-y">
            {members.map((m) => (
              <div key={m.user_id} className="flex items-center gap-3 px-5 py-3">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                  {(m.name || '?')[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{m.name}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[m.role] || ''}`}>
                  {m.role}
                </span>
                {m.role !== 'owner' && (
                  <>
                    <select
                      value={m.role}
                      onChange={(e) => changeRole(m.user_id, e.target.value)}
                      className="rounded border bg-background px-2 py-1 text-xs"
                    >
                      <option value="admin">Admin</option>
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    <button onClick={() => removeMember(m.user_id)} className="rounded p-1 text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Invite */}
        <div className="border-t px-5 py-4">
          <h3 className="mb-2 text-sm font-medium">Invite Member</h3>
          <div className="flex gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Email address"
              className="flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
            <button
              onClick={inviteMember}
              disabled={inviting || !inviteEmail.trim()}
              className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <UserPlus className="h-4 w-4" />
              Invite
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
