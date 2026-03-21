'use client';

import { useState } from 'react';
import { Lead, LeadStatus, LEAD_STATUS_CONFIG, ActivityType } from '@/lib/types';
import { LeadStatusBadge } from './StatusBadge';
import {
  X, Phone, Mail, Globe, MapPin, Building2, User, Calendar,
  MessageSquare, PhoneCall, AtSign, Users, Plus, Clock,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface Props {
  lead: Lead;
  onClose: () => void;
  onLeadUpdated: (lead: Lead) => void;
}

const ACTIVITY_ICONS: Record<ActivityType, React.ReactNode> = {
  note:          <MessageSquare size={13} />,
  call:          <PhoneCall size={13} />,
  email:         <AtSign size={13} />,
  meeting:       <Users size={13} />,
  status_change: <Clock size={13} />,
};

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  note:          'bg-gray-100 text-gray-600',
  call:          'bg-blue-100 text-blue-600',
  email:         'bg-purple-100 text-purple-600',
  meeting:       'bg-green-100 text-green-600',
  status_change: 'bg-amber-100 text-amber-700',
};

export default function LeadDrawer({ lead, onClose, onLeadUpdated }: Props) {
  const [actType, setActType] = useState<ActivityType>('note');
  const [actText, setActText] = useState('');
  const [saving, setSaving] = useState(false);

  const activityLog = [...(lead.activityLog ?? [])].reverse();

  const addActivity = async () => {
    if (!actText.trim()) return;
    setSaving(true);
    const res = await fetch(`/api/leads/${lead.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: actType, text: actText.trim() }),
    });
    const updated = await res.json();
    onLeadUpdated(updated);
    setActText('');
    setSaving(false);
  };

  const updateStatus = async (status: LeadStatus) => {
    const res = await fetch(`/api/leads/${lead.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...lead, status, lastContact: new Date().toISOString() }),
    });
    const updated = await res.json();
    onLeadUpdated(updated);
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-[420px] bg-white h-full shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-bold text-gray-900 text-base leading-tight truncate">{lead.businessName}</h2>
            {lead.contactPerson && (
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                <User size={12} /> {lead.contactPerson}
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg shrink-0">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Status */}
          <div className="px-5 py-4 border-b">
            <p className="text-xs font-medium text-gray-500 mb-2">Status</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(LEAD_STATUS_CONFIG).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => updateStatus(k as LeadStatus)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition ${
                    lead.status === k
                      ? 'border-transparent ' + v.bg + ' ' + v.text
                      : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Info grid */}
          <div className="px-5 py-4 border-b space-y-2">
            <p className="text-xs font-medium text-gray-500 mb-2">Details</p>
            {lead.industry && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Building2 size={14} className="text-gray-400 shrink-0" />
                {lead.industry}
              </div>
            )}
            {lead.phone && (
              <a href={`tel:${lead.phone}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600">
                <Phone size={14} className="text-gray-400 shrink-0" />
                {lead.phone}
              </a>
            )}
            {lead.email && (
              <a href={`mailto:${lead.email}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 truncate">
                <Mail size={14} className="text-gray-400 shrink-0" />
                {lead.email}
              </a>
            )}
            {lead.website && (
              <a href={`https://${lead.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline truncate">
                <Globe size={14} className="text-gray-400 shrink-0" />
                {lead.website}
              </a>
            )}
            {(lead.address || lead.city) && (
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <MapPin size={14} className="text-gray-400 shrink-0 mt-0.5" />
                <span>{[lead.address, lead.city].filter(Boolean).join(', ')}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar size={14} className="text-gray-400 shrink-0" />
              Added {lead.dateAdded ? format(new Date(lead.dateAdded), 'dd MMM yyyy') : '—'}
            </div>
            {lead.lastContact && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock size={14} className="text-gray-400 shrink-0" />
                Last contact {format(new Date(lead.lastContact), 'dd MMM yyyy')}
              </div>
            )}
          </div>

          {/* Notes */}
          {lead.notes && (
            <div className="px-5 py-4 border-b">
              <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{lead.notes}</p>
            </div>
          )}

          {/* Add Activity */}
          <div className="px-5 py-4 border-b">
            <p className="text-xs font-medium text-gray-500 mb-2">Log Activity</p>
            <div className="flex gap-1.5 mb-2">
              {(['call', 'email', 'meeting', 'note'] as ActivityType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setActType(t)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium capitalize border transition ${
                    actType === t
                      ? ACTIVITY_COLORS[t] + ' border-transparent'
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {ACTIVITY_ICONS[t]} {t}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={
                  actType === 'call' ? 'Spoke with contact, discussed pricing...' :
                  actType === 'email' ? 'Sent proposal via email...' :
                  actType === 'meeting' ? 'Met at their office, demo went well...' :
                  'Add a note...'
                }
                value={actText}
                onChange={(e) => setActText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && addActivity()}
              />
              <button
                onClick={addActivity}
                disabled={saving || !actText.trim()}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 transition"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Activity Log */}
          <div className="px-5 py-4">
            <p className="text-xs font-medium text-gray-500 mb-3">Activity ({activityLog.length})</p>
            {activityLog.length === 0 ? (
              <p className="text-sm text-gray-400">No activity yet. Log a call, email, or note above.</p>
            ) : (
              <div className="space-y-3">
                {activityLog.map((entry) => (
                  <div key={entry.id} className="flex gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${ACTIVITY_COLORS[entry.type]}`}>
                      {ACTIVITY_ICONS[entry.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 leading-snug">{entry.text}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDistanceToNow(new Date(entry.date), { addSuffix: true })}
                        {' · '}{format(new Date(entry.date), 'dd MMM yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
