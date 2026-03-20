'use client';

import { useState } from 'react';
import { Lead, LeadStatus, LEAD_STATUS_CONFIG } from '@/lib/types';
import { X, Loader2, MapPin } from 'lucide-react';

interface Props {
  initialData?: Partial<Lead>;
  existingLead?: Lead;
  onClose: () => void;
  onSaved: (lead: Lead) => void;
}

const INDUSTRIES = [
  'Restaurant', 'Retail', 'Food & Beverage', 'Technology', 'Healthcare',
  'Automotive', 'Real Estate', 'Education', 'Finance', 'Legal',
  'Health & Wellness', 'Beauty & Salon', 'Construction', 'Hotels & Tourism',
  'Manufacturing', 'Logistics', 'Marketing', 'Other',
];

const SOURCES = ['cold_call', 'referral', 'instagram', 'facebook', 'google', 'walk_in', 'manual', 'other'];

export default function AddLeadModal({ initialData, existingLead, onClose, onSaved }: Props) {
  const [form, setForm] = useState<Partial<Lead>>({
    status: 'new',
    source: 'manual',
    industry: '',
    ...initialData,
    ...existingLead,
  });
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  const set = (k: keyof Lead, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  const geocodeAddress = async () => {
    if (!form.address) return;
    setGeocoding(true);
    try {
      const q = [form.address, form.city].filter(Boolean).join(', ');
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (data[0]) {
        setForm((f) => ({ ...f, lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }));
      }
    } catch { /* ignore */ }
    setGeocoding(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const isEdit = !!existingLead;
      const url = isEdit ? `/api/leads/${existingLead!.id}` : '/api/leads';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, lastContact: isEdit ? form.lastContact : '' }),
      });
      const lead = await res.json();
      onSaved(lead);
    } catch {
      alert('Failed to save lead');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">
            {existingLead ? 'Edit Lead' : 'Add New Lead'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Business Name *</label>
              <input required className="input" value={form.businessName || ''} onChange={(e) => set('businessName', e.target.value)} placeholder="Bella Vista Restaurant" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Contact Person</label>
              <input className="input" value={form.contactPerson || ''} onChange={(e) => set('contactPerson', e.target.value)} placeholder="John Smith" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Industry</label>
              <select className="input" value={form.industry || ''} onChange={(e) => set('industry', e.target.value)}>
                <option value="">Select...</option>
                {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
              <input className="input" value={form.phone || ''} onChange={(e) => set('phone', e.target.value)} placeholder="+49 30 12345678" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
              <input type="email" className="input" value={form.email || ''} onChange={(e) => set('email', e.target.value)} placeholder="info@company.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Website</label>
              <input className="input" value={form.website || ''} onChange={(e) => set('website', e.target.value)} placeholder="www.company.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Employees</label>
              <select className="input" value={form.employees || ''} onChange={(e) => set('employees', e.target.value)}>
                <option value="">Unknown</option>
                {['1-2','2-5','5-10','10-20','20-50','50-100','100+'].map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* Address + geocode */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Street Address</label>
            <div className="flex gap-2">
              <input className="input flex-1" value={form.address || ''} onChange={(e) => set('address', e.target.value)} placeholder="Unter den Linden 21" />
              <button
                type="button"
                onClick={geocodeAddress}
                disabled={geocoding}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs flex items-center gap-1 text-gray-700"
              >
                {geocoding ? <Loader2 size={12} className="animate-spin" /> : <MapPin size={12} />}
                Locate
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
              <input className="input" value={form.city || ''} onChange={(e) => set('city', e.target.value)} placeholder="Berlin" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Lat</label>
                <input type="number" step="any" className="input" value={form.lat || ''} onChange={(e) => set('lat', parseFloat(e.target.value))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Lng</label>
                <input type="number" step="any" className="input" value={form.lng || ''} onChange={(e) => set('lng', parseFloat(e.target.value))} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select className="input" value={form.status || 'new'} onChange={(e) => set('status', e.target.value as LeadStatus)}>
                {Object.entries(LEAD_STATUS_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Source</label>
              <select className="input" value={form.source || 'manual'} onChange={(e) => set('source', e.target.value)}>
                {SOURCES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              rows={3}
              className="input resize-none"
              value={form.notes || ''}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Any notes about this lead..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {existingLead ? 'Save Changes' : 'Add Lead'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          outline: none;
          transition: box-shadow 0.15s;
        }
        .input:focus {
          box-shadow: 0 0 0 2px #3b82f680;
          border-color: #3b82f6;
        }
      `}</style>
    </div>
  );
}
