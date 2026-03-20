'use client';

import { useState, useMemo } from 'react';
import { Client, ClientStatus, CLIENT_STATUS_CONFIG } from '@/lib/types';
import { ClientStatusBadge } from './StatusBadge';
import ClientModal from './ClientModal';
import { Search, Plus, Trash2, Edit2, Phone, Mail, Globe, Euro, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  clients: Client[];
  onClientsChanged: () => void;
}

export default function ClientTable({ clients, onClientsChanged }: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClientStatus | 'all'>('all');
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let data = clients;
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (c) =>
          c.businessName.toLowerCase().includes(q) ||
          c.contactPerson?.toLowerCase().includes(q) ||
          c.industry?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') data = data.filter((c) => c.status === statusFilter);
    return data;
  }, [clients, search, statusFilter]);

  const totalMonthlyRevenue = clients
    .filter((c) => c.status === 'active')
    .reduce((sum, c) => sum + (c.monthlyRetainer || 0), 0);

  const deleteClient = async (id: string) => {
    if (!confirm('Delete this client?')) return;
    await fetch(`/api/clients/${id}`, { method: 'DELETE' });
    onClientsChanged();
  };

  const updateStatus = async (client: Client, status: ClientStatus) => {
    await fetch(`/api/clients/${client.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...client, status }),
    });
    onClientsChanged();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Summary cards */}
      <div className="p-4 border-b bg-white grid grid-cols-4 gap-4">
        <div className="bg-green-50 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">Total Clients</p>
          <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">Active</p>
          <p className="text-2xl font-bold text-blue-600">{clients.filter((c) => c.status === 'active').length}</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">Monthly Revenue</p>
          <p className="text-2xl font-bold text-emerald-600">€{totalMonthlyRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">Avg. Retainer</p>
          <p className="text-2xl font-bold text-amber-600">
            €{clients.filter(c=>c.status==='active').length ? Math.round(totalMonthlyRevenue / clients.filter(c=>c.status==='active').length).toLocaleString() : 0}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-4 py-3 bg-white border-b flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ClientStatus | 'all')}
          className="text-sm border rounded-lg px-2 py-2 focus:outline-none"
        >
          <option value="all">All Statuses</option>
          {Object.entries(CLIENT_STATUS_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <button
          onClick={() => setAddOpen(true)}
          className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center gap-2 ml-auto"
        >
          <Plus size={16} /> Add Client
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Client</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Retainer</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Services</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Contract</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Contact</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                  No clients yet. Convert a lead or add a client manually!
                </td>
              </tr>
            )}
            {filtered.map((client) => (
              <>
                <tr
                  key={client.id}
                  className="border-b hover:bg-green-50/20 transition-colors cursor-pointer"
                  onClick={() => setExpandedId(expandedId === client.id ? null : client.id)}
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-semibold text-gray-900">{client.businessName}</p>
                      {client.contactPerson && <p className="text-xs text-gray-500">{client.contactPerson}</p>}
                      {client.industry && <p className="text-xs text-gray-400">{client.industry}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={client.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => updateStatus(client, e.target.value as ClientStatus)}
                      className="text-xs border rounded px-1.5 py-1 focus:outline-none"
                    >
                      {Object.entries(CLIENT_STATUS_CONFIG).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                    <div className="mt-1"><ClientStatusBadge status={client.status} /></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                      <Euro size={14} />
                      {client.monthlyRetainer.toLocaleString()}/mo
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1 max-w-48">
                      {client.services.slice(0, 3).map((s) => (
                        <span key={s} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{s}</span>
                      ))}
                      {client.services.length > 3 && (
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">+{client.services.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={11} />
                      {client.contractStart ? format(new Date(client.contractStart), 'dd MMM yyyy') : '—'}
                    </div>
                    {client.contractEnd && (
                      <div className="text-gray-400">→ {format(new Date(client.contractEnd), 'dd MMM yyyy')}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      {client.phone && (
                        <a href={`tel:${client.phone}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600">
                          <Phone size={11} /> {client.phone}
                        </a>
                      )}
                      {client.email && (
                        <a href={`mailto:${client.email}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600 truncate max-w-36">
                          <Mail size={11} /> {client.email}
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-center">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditClient(client); }}
                        className="p-1.5 hover:bg-blue-100 text-blue-600 rounded-lg transition"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteClient(client.id); }}
                        className="p-1.5 hover:bg-red-100 text-red-500 rounded-lg transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
                {/* Expanded notes row */}
                {expandedId === client.id && (
                  <tr key={`${client.id}-expanded`} className="bg-green-50/30 border-b">
                    <td colSpan={7} className="px-8 py-3">
                      <div className="grid grid-cols-3 gap-4 text-xs">
                        <div>
                          <p className="font-medium text-gray-700 mb-1">All Services</p>
                          <div className="flex flex-wrap gap-1">
                            {client.services.map((s) => (
                              <span key={s} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{s}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700 mb-1">Notes</p>
                          <p className="text-gray-600">{client.notes || 'No notes'}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700 mb-1">Links</p>
                          {client.website && (
                            <a href={`https://${client.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                              <Globe size={11} /> {client.website}
                            </a>
                          )}
                          <p className="text-gray-400 mt-1">Client since: {client.dateAdded ? format(new Date(client.dateAdded), 'dd MMM yyyy') : '—'}</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {addOpen && (
        <ClientModal
          onClose={() => setAddOpen(false)}
          onSaved={() => { setAddOpen(false); onClientsChanged(); }}
        />
      )}
      {editClient && (
        <ClientModal
          existingClient={editClient}
          onClose={() => setEditClient(null)}
          onSaved={() => { setEditClient(null); onClientsChanged(); }}
        />
      )}
    </div>
  );
}
