'use client';

import { useState, useEffect } from 'react';
import { Lead, Client, LEAD_STATUS_CONFIG } from '@/lib/types';
import { Users, Briefcase, Euro, Target, TrendingUp, MapPin, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { LeadStatusBadge } from '@/components/StatusBadge';
import { format } from 'date-fns';

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/leads').then(r => r.json()),
      fetch('/api/clients').then(r => r.json()),
    ]).then(([l, c]) => { setLeads(l); setClients(c); });
  }, []);

  const activeClients = clients.filter(c => c.status === 'active');
  const monthlyRevenue = activeClients.reduce((s, c) => s + c.monthlyRetainer, 0);
  const wonLeads = leads.filter(l => l.status === 'closed_won').length + clients.length;
  const conversionRate = leads.length > 0 ? ((wonLeads / leads.length) * 100).toFixed(1) : '0';
  const hotLeads = leads.filter(l => ['interested', 'negotiating', 'proposal_sent'].includes(l.status));
  const recentLeads = [...leads].sort((a, b) => b.dateAdded.localeCompare(a.dateAdded)).slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Leads', value: leads.length, icon: Users, color: '#3B82F6', sub: `${hotLeads.length} hot leads` },
          { label: 'Active Clients', value: activeClients.length, icon: Briefcase, color: '#10B981', sub: `${clients.length} total` },
          { label: 'Monthly Revenue', value: `€${monthlyRevenue.toLocaleString()}`, icon: Euro, color: '#059669', sub: `€${activeClients.length ? Math.round(monthlyRevenue / activeClients.length).toLocaleString() : 0} avg` },
          { label: 'Conversion Rate', value: `${conversionRate}%`, icon: Target, color: '#8B5CF6', sub: `${wonLeads} leads won` },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl p-5 border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{c.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{c.value}</p>
                <p className="text-xs text-gray-400 mt-1">{c.sub}</p>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: c.color + '20' }}>
                <c.icon size={20} style={{ color: c.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Status breakdown */}
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Lead Pipeline</h2>
            <Link href="/leads" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {Object.entries(LEAD_STATUS_CONFIG).map(([k, v]) => {
              const count = leads.filter(l => l.status === k).length;
              const pct = leads.length > 0 ? (count / leads.length) * 100 : 0;
              return (
                <div key={k}>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="text-gray-600">{v.label}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: v.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent leads */}
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Recent Leads</h2>
            <Link href="/leads" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {recentLeads.length === 0 && <p className="text-sm text-gray-400">No leads yet</p>}
            {recentLeads.map((lead) => (
              <div key={lead.id} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: LEAD_STATUS_CONFIG[lead.status].color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{lead.businessName}</p>
                  <div className="flex items-center gap-2">
                    <LeadStatusBadge status={lead.status} />
                    {lead.city && <span className="text-xs text-gray-400 flex items-center gap-0.5"><MapPin size={10} />{lead.city}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hot leads */}
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">🔥 Hot Leads</h2>
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{hotLeads.length} leads</span>
          </div>
          <div className="space-y-3">
            {hotLeads.length === 0 && <p className="text-sm text-gray-400">No hot leads yet</p>}
            {hotLeads.slice(0, 5).map((lead) => (
              <div key={lead.id} className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                <p className="text-sm font-semibold text-gray-900">{lead.businessName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <LeadStatusBadge status={lead.status} />
                </div>
                {lead.notes && (
                  <p className="text-xs text-gray-500 mt-1 truncate">{lead.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active clients overview */}
      {activeClients.length > 0 && (
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Active Clients</h2>
            <Link href="/clients" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              Manage <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {activeClients.map((client) => (
              <div key={client.id} className="p-3 bg-green-50 rounded-xl border border-green-100">
                <p className="font-semibold text-sm text-gray-900 truncate">{client.businessName}</p>
                <p className="text-xs text-gray-500">{client.contactPerson}</p>
                <p className="text-lg font-bold text-emerald-600 mt-2">€{client.monthlyRetainer.toLocaleString()}<span className="text-xs font-normal text-gray-400">/mo</span></p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {client.services.slice(0, 2).map(s => (
                    <span key={s} className="text-xs bg-white border rounded px-1.5 py-0.5 text-gray-600">{s}</span>
                  ))}
                  {client.services.length > 2 && <span className="text-xs text-gray-400">+{client.services.length - 2}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
