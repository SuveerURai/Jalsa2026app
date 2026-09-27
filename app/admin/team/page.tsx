 'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Users, UserPlus, Trash2, ShieldCheck, Loader2 } from 'lucide-react';
import { adminFetch } from '@/lib/admin-client';

type Role = 'SUPER_ADMIN' | 'ADMIN' | 'SCANNER';
type Member = { id: string; user_id: string; email: string; full_name: string; role: Role; created_at: string };

const roleDescriptions: Record<Role, string> = {
  SUPER_ADMIN: 'Full access, including team management.',
  ADMIN: 'Registrations, payments, analytics, settings and operational tools.',
  SCANNER: 'QR scanner and entry operations only.'
};

export default function TeamManagementPage() {
  const [team, setTeam] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<Role>('SCANNER');

  const loadTeam = async () => {
    setLoading(true); setError('');
    try {
      const res = await adminFetch('/api/admin/team');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to load team.');
      setTeam(data.team || []);
    } catch (e: any) { setError(e.message || 'Unable to load team.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadTeam(); }, []);

  const addMember = async (e: FormEvent) => {
    e.preventDefault(); setSaving(true); setError(''); setMessage('');
    try {
      const res = await adminFetch('/api/admin/team', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, full_name: fullName, role })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to add team member.');
      setMessage(`${fullName} was added as ${role}.`);
      setEmail(''); setFullName(''); setRole('SCANNER'); await loadTeam();
    } catch (e: any) { setError(e.message || 'Unable to add team member.'); }
    finally { setSaving(false); }
  };

  const changeRole = async (member: Member, nextRole: Role) => {
    setError(''); setMessage('');
    try {
      const res = await adminFetch('/api/admin/team', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: member.id, role: nextRole })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to update role.');
      setMessage(`${member.full_name}'s role was updated.`); await loadTeam();
    } catch (e: any) { setError(e.message || 'Unable to update role.'); }
  };

  const removeMember = async (member: Member) => {
    if (!window.confirm(`Remove ${member.full_name} from the JALSA admin team?`)) return;
    setError(''); setMessage('');
    try {
      const res = await adminFetch('/api/admin/team', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: member.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to remove team member.');
      setMessage(`${member.full_name} was removed from the team.`); await loadTeam();
    } catch (e: any) { setError(e.message || 'Unable to remove team member.'); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-dark-border pb-6">
        <div className="flex items-center gap-3">
          <Users className="w-7 h-7 text-amber-400" />
          <h1 className="text-3xl font-black text-white">Team Management</h1>
        </div>
        <p className="mt-2 text-sm text-zinc-400 max-w-2xl">Manage admin and volunteer access without sharing your Super Admin account.</p>
      </div>

      {error && <div className="rounded-xl border border-red-800 bg-red-950/30 px-4 py-3 text-sm text-red-300">{error}</div>}
      {message && <div className="rounded-xl border border-emerald-800 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-300">{message}</div>}

      <section className="bg-dark-card border border-dark-border rounded-2xl p-6">
        <div className="flex items-center gap-2"><UserPlus className="w-5 h-5 text-amber-400" /><h2 className="text-xl font-bold text-white">Add Team Member</h2></div>
        <p className="mt-1 text-sm text-zinc-400">Create the person's account first under Supabase → Authentication → Users. This page only assigns the JALSA role.</p>
        <form onSubmit={addMember} className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <input required value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Full name" className="rounded-xl border border-dark-border bg-black/30 px-4 py-3 text-white outline-none focus:border-amber-400" />
          <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Supabase Auth email" className="rounded-xl border border-dark-border bg-black/30 px-4 py-3 text-white outline-none focus:border-amber-400" />
          <select value={role} onChange={e=>setRole(e.target.value as Role)} className="rounded-xl border border-dark-border bg-black/30 px-4 py-3 text-white outline-none focus:border-amber-400">
            <option value="SCANNER">SCANNER</option><option value="ADMIN">ADMIN</option><option value="SUPER_ADMIN">SUPER_ADMIN</option>
          </select>
          <button disabled={saving} className="rounded-xl bg-amber-400 px-5 py-3 font-bold text-black disabled:opacity-50">{saving ? 'Adding...' : 'Add Member'}</button>
        </form>
      </section>

      <section className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-dark-border"><h2 className="text-xl font-bold text-white">Current Team</h2></div>
        {loading ? <div className="p-8 text-zinc-400 flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" />Loading team...</div> : team.length === 0 ? <div className="p-8 text-zinc-400">No team members found.</div> : (
          <div className="divide-y divide-dark-border">
            {team.map(member => (
              <div key={member.id} className="p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                <div>
                  <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-400" /><span className="font-bold text-white">{member.full_name}</span></div>
                  <div className="text-sm text-zinc-400 mt-1">{member.email}</div>
                  <div className="text-xs text-zinc-500 mt-2">{roleDescriptions[member.role]}</div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <select value={member.role} onChange={e=>changeRole(member,e.target.value as Role)} className="rounded-lg border border-dark-border bg-black/30 px-3 py-2 text-sm text-white">
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option><option value="ADMIN">ADMIN</option><option value="SCANNER">SCANNER</option>
                  </select>
                  <button onClick={()=>removeMember(member)} className="rounded-lg border border-red-900 px-3 py-2 text-sm font-semibold text-red-300 hover:bg-red-950/30 flex items-center gap-1.5"><Trash2 className="w-4 h-4" />Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(Object.keys(roleDescriptions) as Role[]).map(r => <div key={r} className="rounded-2xl border border-dark-border bg-dark-card p-5"><div className="font-bold text-amber-300">{r}</div><p className="mt-2 text-sm text-zinc-400">{roleDescriptions[r]}</p></div>)}
      </section>
    </div>
  );
}
