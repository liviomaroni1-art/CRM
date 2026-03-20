'use client';

import { useState, useEffect } from 'react';
import { Client } from '@/lib/types';
import ClientTable from '@/components/ClientTable';
import { RefreshCw } from 'lucide-react';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    setLoading(true);
    const res = await fetch('/api/clients');
    const data = await res.json();
    setClients(data);
    setLoading(false);
  };

  useEffect(() => { fetchClients(); }, []);

  return (
    <div className="flex flex-col h-screen">
      <div className="px-6 py-4 bg-white border-b flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500">{clients.filter(c=>c.status==='active').length} active clients</p>
        </div>
        <button onClick={fetchClients} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        {loading && clients.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <RefreshCw size={24} className="animate-spin text-gray-400" />
          </div>
        ) : (
          <ClientTable clients={clients} onClientsChanged={fetchClients} />
        )}
      </div>
    </div>
  );
}
