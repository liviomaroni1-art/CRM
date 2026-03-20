'use client';

import { useState, useEffect, useMemo } from 'react';
import { Lead, Client, LEAD_STATUS_CONFIG } from '@/lib/types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, FunnelChart, Funnel, LabelList,
} from 'recharts';
import { TrendingUp, TrendingDown, Users, Briefcase, Euro, Target } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16', '#EC4899'];

export default function AnalyticsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    Promise.all([fetch('/api/leads').then(r => r.json()), fetch('/api/clients').then(r => r.json())])
      .then(([l, c]) => { setLeads(l); setClients(c); });
  }, []);

  // --- Key Metrics ---
  const totalLeads = leads.length;
  const contactedLeads = leads.filter(l =>
    ['contacted','no_answer','interested','not_interested','proposal_sent','negotiating','closed_won','closed_lost'].includes(l.status)
  ).length;
  const respondedLeads = leads.filter(l =>
    ['interested','not_interested','proposal_sent','negotiating','closed_won','closed_lost'].includes(l.status)
  ).length;
  const interestedLeads = leads.filter(l =>
    ['interested','proposal_sent','negotiating','closed_won'].includes(l.status)
  ).length;
  const wonLeads = leads.filter(l => l.status === 'closed_won').length + clients.length;
  const activeClients = clients.filter(c => c.status === 'active').length;
  const monthlyRevenue = clients.filter(c => c.status === 'active').reduce((s, c) => s + c.monthlyRetainer, 0);

  const contactRate = totalLeads > 0 ? ((contactedLeads / totalLeads) * 100).toFixed(1) : '0';
  const responseRate = contactedLeads > 0 ? ((respondedLeads / contactedLeads) * 100).toFixed(1) : '0';
  const interestRate = respondedLeads > 0 ? ((interestedLeads / respondedLeads) * 100).toFixed(1) : '0';
  const conversionRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : '0';

  // --- Status distribution ---
  const statusData = Object.entries(LEAD_STATUS_CONFIG).map(([k, v]) => ({
    name: v.label,
    value: leads.filter(l => l.status === k).length,
    color: v.color,
  })).filter(d => d.value > 0);

  // --- Industry breakdown ---
  const industryData = useMemo(() => {
    const map: Record<string, number> = {};
    leads.forEach(l => { if (l.industry) map[l.industry] = (map[l.industry] || 0) + 1; });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [leads]);

  // --- Leads per month (last 6 months) ---
  const monthlyLeads = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const month = subMonths(new Date(), 5 - i);
      const start = startOfMonth(month);
      const end = endOfMonth(month);
      const count = leads.filter(l => {
        try {
          return isWithinInterval(parseISO(l.dateAdded), { start, end });
        } catch { return false; }
      }).length;
      const wonCount = leads.filter(l => {
        try {
          return l.status === 'closed_won' && isWithinInterval(parseISO(l.lastContact || l.dateAdded), { start, end });
        } catch { return false; }
      }).length;
      return { month: format(month, 'MMM yy'), leads: count, won: wonCount };
    });
  }, [leads]);

  // --- Client services distribution ---
  const servicesData = useMemo(() => {
    const map: Record<string, number> = {};
    clients.forEach(c => c.services.forEach(s => { map[s] = (map[s] || 0) + 1; }));
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a,b)=>b.value-a.value);
  }, [clients]);

  // --- Funnel data ---
  const funnelData = [
    { name: 'Total Leads', value: totalLeads, fill: '#6B7280' },
    { name: 'Contacted', value: contactedLeads, fill: '#3B82F6' },
    { name: 'Responded', value: respondedLeads, fill: '#F59E0B' },
    { name: 'Interested', value: interestedLeads, fill: '#10B981' },
    { name: 'Won / Client', value: wonLeads, fill: '#059669' },
  ];

  // --- Source breakdown ---
  const sourceData = useMemo(() => {
    const map: Record<string, number> = {};
    leads.forEach(l => { const s = l.source || 'unknown'; map[s] = (map[s] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name: name.replace('_',' '), value }));
  }, [leads]);

  const MetricCard = ({ title, value, sub, icon: Icon, color }: {
    title: string; value: string | number; sub?: string; icon: React.ElementType; color: string;
  }) => (
    <div className="bg-white rounded-xl p-5 border">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center`} style={{ background: color + '20' }}>
          <Icon size={20} style={{ color }} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500">Performance overview of your leads and clients</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Leads" value={totalLeads} sub={`${contactRate}% contacted`} icon={Users} color="#3B82F6" />
        <MetricCard title="Response Rate" value={`${responseRate}%`} sub={`${respondedLeads} of ${contactedLeads} responded`} icon={TrendingUp} color="#10B981" />
        <MetricCard title="Conversion Rate" value={`${conversionRate}%`} sub={`${wonLeads} leads won`} icon={Target} color="#8B5CF6" />
        <MetricCard title="Monthly Revenue" value={`€${monthlyRevenue.toLocaleString()}`} sub={`${activeClients} active clients`} icon={Euro} color="#059669" />
      </div>

      {/* Conversion rates row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Contact Rate', value: contactRate, desc: 'Leads contacted', color: '#3B82F6' },
          { label: 'Response Rate', value: responseRate, desc: 'Contacted → Response', color: '#F59E0B' },
          { label: 'Interest Rate', value: interestRate, desc: 'Responses → Interested', color: '#10B981' },
          { label: 'Win Rate', value: conversionRate, desc: 'Total → Client', color: '#8B5CF6' },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-xl p-4 border">
            <p className="text-xs text-gray-500 mb-2">{m.label}</p>
            <div className="flex items-end gap-2 mb-2">
              <p className="text-2xl font-bold" style={{ color: m.color }}>{m.value}%</p>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className="h-1.5 rounded-full" style={{ width: `${Math.min(parseFloat(m.value), 100)}%`, background: m.color }} />
            </div>
            <p className="text-xs text-gray-400 mt-1">{m.desc}</p>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-2 gap-6">
        {/* Funnel */}
        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Lead Conversion Funnel</h3>
          <div className="space-y-2">
            {funnelData.map((step, i) => {
              const pct = funnelData[0].value > 0 ? (step.value / funnelData[0].value) * 100 : 0;
              return (
                <div key={step.name}>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{step.name}</span>
                    <span className="font-semibold">{step.value} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-5">
                    <div
                      className="h-5 rounded-full flex items-center px-2"
                      style={{ width: `${Math.max(pct, 8)}%`, background: step.fill }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Leads */}
        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Leads Over Time</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyLeads}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="leads" name="New Leads" fill="#3B82F6" radius={[4,4,0,0]} />
              <Bar dataKey="won" name="Won" fill="#10B981" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-3 gap-6">
        {/* Status pie */}
        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Lead Status Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={11}>
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1">
            {statusData.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                <span className="text-gray-600 flex-1">{d.name}</span>
                <span className="font-semibold">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Industry */}
        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Leads by Industry</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={industryData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={90} />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Services */}
        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Services Sold</h3>
          {servicesData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center mt-8">No clients yet</p>
          ) : (
            <div className="space-y-2 mt-2">
              {servicesData.slice(0, 7).map((s, i) => (
                <div key={s.name}>
                  <div className="flex justify-between text-xs text-gray-600 mb-0.5">
                    <span>{s.name}</span><span>{s.value}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="h-2 rounded-full" style={{ width: `${(s.value / (servicesData[0]?.value || 1)) * 100}%`, background: COLORS[i % COLORS.length] }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Source + Client Revenue */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Lead Sources</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={sourceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                {sourceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Client Revenue Breakdown</h3>
          {clients.length === 0 ? (
            <p className="text-sm text-gray-400 text-center mt-8">No clients yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={clients.filter(c=>c.status==='active').map(c => ({ name: c.businessName.substring(0,15), retainer: c.monthlyRetainer }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => `€${v}`} />
                <Bar dataKey="retainer" name="Monthly (€)" fill="#10B981" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
