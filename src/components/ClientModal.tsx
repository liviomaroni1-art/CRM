'use client';

import { useState } from 'react';
import { Client, ClientStatus, SERVICE_OPTIONS, CLIENT_STATUS_CONFIG, Lead } from '@/lib/types';
import { X, Loader2 } from 'lucide-react';

interface Props {
  existingClient?: Client;
  fromLead?: Lead;
  onClose: () => void;
  onSaved: (client: Client) => void;
}

const INDUSTRIES = [
  'Restaurant', 'Retail', 'Food & Beverage', 'Technology', 'Healthcare',
  'Automotive', 'Real Estate', 'Education', 'Finance', 'Legal',
  'Health & Wellness', 'Beauty & Salon', 'Construction', 'Hotels & Tourism',
  'Manufacturing', 'Logistics', 'Marketing', 'Other',
];

export default function ClientModal({ existingClient, fromLead, onClose, onSaved }: Props) {
  const [form, setForm] = useState<Partial<Client>>({
    status: 'active',
    services: [],
    monthlyRetainer: 0,
    contractStart: new Date().toISOString().split('T')[0],
    ...(fromLead
      ? {
          leadId: fromLead.id,
          businessName: fromLead.businessName,
          contactPerson: fromLead.contactPerson,
          phone: fromLead.phone,
          email: fromLead.email,
          address: fromLead.address,
          industry: fromLead.industry,
          website: fromLead.website,
        }
      : {}),
    ...existingClient,
  });
  const [loading, setLoading] = useState(false);

  const set = (k: keyof Client, v: string | number | string[]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleService = (s: string) => {
    const cur = form.services || [];
    set('services', cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const isEdit = !!existingClient;
      const url = isEdit ? `/api/clients/${existingClient!.id}` : '/api/clients';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const client = await res.json();
      // If from lead, also update lead status to closed_won
      if (fromLead) {
        await fetch(`/api/leads/${fromLead.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...fromLead, status: 'closed_won' }),
        });
      }
      onSaved(client);
    } catch {
      alert('Failed to save client');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {existingClient ? 'Edit Client' : fromLead ? 'Convert Lead to Client' : 'Add New Client'}
            </h2>
            {fromLead && (
              <p className="text-xs text-green-600 mt-0.5">Converting: {fromLead.businessName}</p>
            )}
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="label">Business Name *</label>
              <input required className="input" value={form.businessName || ''} onChange={(e) => set('businessName', e.target.value)} />
            </div>
            <div>
              <label className="label">Contact Person</label>
              <input className="input" value={form.contactPerson || ''} onChange={(e) => set('contactPerson', e.target.value)} />
            </div>
            <div>
              <label className="label">Industry</label>
              <select className="input" value={form.industry || ''} onChange={(e) => set('industry', e.target.value)}>
                <option value="">Select...</option>
                {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={form.phone || ''} onChange={(e) => set('phone', e.target.value)} />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" value={form.email || ''} onChange={(e) => set('email', e.target.value)} />
            </div>
            <div>
              <label className="label">Website</label>
              <input className="input" value={form.website || ''} onChange={(e) => set('website', e.target.value)} placeholder="www.example.com" />
            </div>
            <div>
              <label className="label">Address</label>
              <input className="input" value={form.address || ''} onChange={(e) => set('address', e.target.value)} />
            </div>
          </div>

          {/* Contract */}
          <div className="border rounded-xl p-4 bg-green-50/30 space-y-3">
            <h3 className="font-semibold text-sm text-gray-800">Contract Details</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label">Monthly Retainer (€)</label>
                <input
                  type="number"
                  className="input"
                  value={form.monthlyRetainer || ''}
                  onChange={(e) => set('monthlyRetainer', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="label">Contract Start</label>
                <input
                  type="date"
                  className="input"
                  value={form.contractStart || ''}
                  onChange={(e) => set('contractStart', e.target.value)}
                />
              </div>
              <div>
                <label className="label">Contract End</label>
                <input
                  type="date"
                  className="input"
                  value={form.contractEnd || ''}
                  onChange={(e) => set('contractEnd', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status || 'active'} onChange={(e) => set('status', e.target.value as ClientStatus)}>
                {Object.entries(CLIENT_STATUS_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Services */}
          <div>
            <label className="label mb-2">Services</label>
            <div className="flex flex-wrap gap-2">
              {SERVICE_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleService(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                    form.services?.includes(s)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea
              rows={3}
              className="input resize-none"
              value={form.notes || ''}
              onChange={(e) => set('notes', e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {existingClient ? 'Save Changes' : fromLead ? 'Convert to Client' : 'Add Client'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .label { display: block; font-size: 0.75rem; font-weight: 500; color: #374151; margin-bottom: 4px; }
        .input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          outline: none;
          background: white;
        }
        .input:focus { box-shadow: 0 0 0 2px #3b82f680; border-color: #3b82f6; }
      `}</style>
    </div>
  );
}
