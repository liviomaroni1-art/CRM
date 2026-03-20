'use client';

import { useState, useEffect } from 'react';
import { Lead } from '@/lib/types';
import dynamic from 'next/dynamic';
import LeadTable from '@/components/LeadTable';
import { Map, Table2, RefreshCw } from 'lucide-react';

const LeadMap = dynamic(() => import('@/components/LeadMap'), { ssr: false });

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [view, setView] = useState<'table' | 'map'>('table');
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    setLoading(true);
    const res = await fetch('/api/leads');
    const data = await res.json();
    setLeads(data);
    setLoading(false);
  };

  useEffect(() => { fetchLeads(); }, []);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-500">{leads.length} leads total</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchLeads} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
            <button
              onClick={() => setView('table')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition ${
                view === 'table' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Table2 size={15} /> Table
            </button>
            <button
              onClick={() => setView('map')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition ${
                view === 'map' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Map size={15} /> Map
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {loading && leads.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <RefreshCw size={24} className="animate-spin text-gray-400" />
          </div>
        ) : view === 'table' ? (
          <LeadTable leads={leads} onLeadsChanged={fetchLeads} />
        ) : (
          <LeadMap leads={leads} onLeadUpdated={fetchLeads} />
        )}
      </div>
    </div>
  );
}
