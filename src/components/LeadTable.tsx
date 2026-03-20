'use client';

import { useState, useMemo } from 'react';
import { Lead, LeadStatus, LEAD_STATUS_CONFIG } from '@/lib/types';
import { LeadStatusBadge } from './StatusBadge';
import AddLeadModal from './AddLeadModal';
import {
  Search, Plus, Trash2, Edit2, Phone, Mail, Globe,
  ChevronUp, ChevronDown, ArrowUpDown, SlidersHorizontal,
  UserCheck
} from 'lucide-react';
import { format } from 'date-fns';
import ClientModal from './ClientModal';

interface Props {
  leads: Lead[];
  onLeadsChanged: () => void;
}

type SortKey = 'businessName' | 'status' | 'industry' | 'dateAdded' | 'lastContact';
type SortDir = 'asc' | 'desc';

export default function LeadTable({ leads, onLeadsChanged }: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('dateAdded');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [convertLead, setConvertLead] = useState<Lead | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const industries = useMemo(
    () => Array.from(new Set(leads.map((l) => l.industry).filter(Boolean))).sort(),
    [leads]
  );

  const filtered = useMemo(() => {
    let data = leads;
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (l) =>
          l.businessName.toLowerCase().includes(q) ||
          l.contactPerson?.toLowerCase().includes(q) ||
          l.city?.toLowerCase().includes(q) ||
          l.email?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') data = data.filter((l) => l.status === statusFilter);
    if (industryFilter !== 'all') data = data.filter((l) => l.industry === industryFilter);

    return [...data].sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      const cmp = String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [leads, search, statusFilter, industryFilter, sortKey, sortDir]);

  const handleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(k); setSortDir('asc'); }
  };

  const deleteLead = async (id: string) => {
    if (!confirm('Delete this lead?')) return;
    await fetch(`/api/leads/${id}`, { method: 'DELETE' });
    onLeadsChanged();
  };

  const bulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} leads?`)) return;
    await Promise.all([...selected].map((id) => fetch(`/api/leads/${id}`, { method: 'DELETE' })));
    setSelected(new Set());
    onLeadsChanged();
  };

  const updateStatus = async (lead: Lead, status: LeadStatus) => {
    await fetch(`/api/leads/${lead.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...lead, status, lastContact: new Date().toISOString() }),
    });
    onLeadsChanged();
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (
      sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />
    ) : (
      <ArrowUpDown size={12} className="opacity-40" />
    );

  const toggleSelect = (id: string) => {
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="p-4 bg-white border-b flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as LeadStatus | 'all')}
            className="text-sm border rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            {Object.entries(LEAD_STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>

          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="text-sm border rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Industries</option>
            {industries.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>

        <div className="flex gap-2 ml-auto">
          {selected.size > 0 && (
            <button onClick={bulkDelete} className="px-3 py-2 bg-red-50 text-red-600 text-sm rounded-lg hover:bg-red-100 flex items-center gap-1.5">
              <Trash2 size={14} /> Delete ({selected.size})
            </button>
          )}
          <button
            onClick={() => setAddOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={16} /> Add Lead
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="px-4 py-2 bg-gray-50 border-b flex gap-4 text-xs text-gray-500">
        <span><b className="text-gray-800">{filtered.length}</b> leads shown</span>
        {Object.entries(LEAD_STATUS_CONFIG).map(([k, v]) => {
          const count = leads.filter((l) => l.status === k).length;
          if (!count) return null;
          return (
            <span key={k} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ background: v.color }} />
              {v.label}: <b className="text-gray-700">{count}</b>
            </span>
          );
        })}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b sticky top-0 z-10">
            <tr>
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  onChange={(e) => setSelected(e.target.checked ? new Set(filtered.map((l) => l.id)) : new Set())}
                  checked={selected.size === filtered.length && filtered.length > 0}
                />
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 cursor-pointer hover:text-gray-900" onClick={() => handleSort('businessName')}>
                <span className="flex items-center gap-1">Business <SortIcon k="businessName" /></span>
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 cursor-pointer hover:text-gray-900" onClick={() => handleSort('status')}>
                <span className="flex items-center gap-1">Status <SortIcon k="status" /></span>
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 cursor-pointer hover:text-gray-900" onClick={() => handleSort('industry')}>
                <span className="flex items-center gap-1">Industry <SortIcon k="industry" /></span>
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Contact</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 cursor-pointer hover:text-gray-900" onClick={() => handleSort('dateAdded')}>
                <span className="flex items-center gap-1">Added <SortIcon k="dateAdded" /></span>
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 cursor-pointer hover:text-gray-900" onClick={() => handleSort('lastContact')}>
                <span className="flex items-center gap-1">Last Contact <SortIcon k="lastContact" /></span>
              </th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                  No leads found. Add your first lead!
                </td>
              </tr>
            )}
            {filtered.map((lead) => (
              <tr key={lead.id} className="border-b hover:bg-blue-50/30 transition-colors">
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selected.has(lead.id)} onChange={() => toggleSelect(lead.id)} />
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-semibold text-gray-900">{lead.businessName}</p>
                    {lead.contactPerson && <p className="text-xs text-gray-500">{lead.contactPerson}</p>}
                    {lead.city && <p className="text-xs text-gray-400">📍 {lead.city}</p>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={lead.status}
                    onChange={(e) => updateStatus(lead, e.target.value as LeadStatus)}
                    className="text-xs border rounded px-1.5 py-1 focus:outline-none"
                    style={{ color: LEAD_STATUS_CONFIG[lead.status].color }}
                  >
                    {Object.entries(LEAD_STATUS_CONFIG).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                  <div className="mt-1"><LeadStatusBadge status={lead.status} /></div>
                </td>
                <td className="px-4 py-3 text-gray-600">{lead.industry || '—'}</td>
                <td className="px-4 py-3">
                  <div className="space-y-0.5">
                    {lead.phone && (
                      <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600">
                        <Phone size={11} /> {lead.phone}
                      </a>
                    )}
                    {lead.email && (
                      <a href={`mailto:${lead.email}`} className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600 truncate max-w-36">
                        <Mail size={11} /> {lead.email}
                      </a>
                    )}
                    {lead.website && (
                      <a href={`https://${lead.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600 truncate max-w-36">
                        <Globe size={11} /> {lead.website}
                      </a>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                  {lead.dateAdded ? format(new Date(lead.dateAdded), 'dd MMM yyyy') : '—'}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                  {lead.lastContact ? format(new Date(lead.lastContact), 'dd MMM yyyy') : '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-center">
                    <button
                      onClick={() => setConvertLead(lead)}
                      title="Convert to Client"
                      className="p-1.5 hover:bg-green-100 text-green-600 rounded-lg transition"
                    >
                      <UserCheck size={15} />
                    </button>
                    <button onClick={() => setEditLead(lead)} className="p-1.5 hover:bg-blue-100 text-blue-600 rounded-lg transition">
                      <Edit2 size={15} />
                    </button>
                    <button onClick={() => deleteLead(lead.id)} className="p-1.5 hover:bg-red-100 text-red-500 rounded-lg transition">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {addOpen && (
        <AddLeadModal
          onClose={() => setAddOpen(false)}
          onSaved={() => { setAddOpen(false); onLeadsChanged(); }}
        />
      )}
      {editLead && (
        <AddLeadModal
          existingLead={editLead}
          onClose={() => setEditLead(null)}
          onSaved={() => { setEditLead(null); onLeadsChanged(); }}
        />
      )}
      {convertLead && (
        <ClientModal
          fromLead={convertLead}
          onClose={() => setConvertLead(null)}
          onSaved={() => { setConvertLead(null); onLeadsChanged(); }}
        />
      )}
    </div>
  );
}
