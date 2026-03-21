export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'no_answer'
  | 'interested'
  | 'not_interested'
  | 'proposal_sent'
  | 'negotiating'
  | 'closed_won'
  | 'closed_lost';

export const LEAD_STATUS_CONFIG: Record<
  LeadStatus,
  { label: string; color: string; bg: string; text: string }
> = {
  new:             { label: 'New',             color: '#6B7280', bg: 'bg-gray-100',   text: 'text-gray-700' },
  contacted:       { label: 'Contacted',       color: '#3B82F6', bg: 'bg-blue-100',   text: 'text-blue-700' },
  no_answer:       { label: 'No Answer',       color: '#F97316', bg: 'bg-orange-100', text: 'text-orange-700' },
  interested:      { label: 'Interested',      color: '#10B981', bg: 'bg-emerald-100',text: 'text-emerald-700' },
  not_interested:  { label: 'Not Interested',  color: '#EF4444', bg: 'bg-red-100',    text: 'text-red-700' },
  proposal_sent:   { label: 'Proposal Sent',   color: '#8B5CF6', bg: 'bg-violet-100', text: 'text-violet-700' },
  negotiating:     { label: 'Negotiating',     color: '#F59E0B', bg: 'bg-amber-100',  text: 'text-amber-700' },
  closed_won:      { label: 'Closed (Won)',    color: '#059669', bg: 'bg-green-100',  text: 'text-green-700' },
  closed_lost:     { label: 'Closed (Lost)',   color: '#DC2626', bg: 'bg-red-100',    text: 'text-red-800' },
};

export type ActivityType = 'note' | 'call' | 'email' | 'meeting' | 'status_change';

export interface ActivityEntry {
  id: string;
  date: string;
  type: ActivityType;
  text: string;
}

export interface Lead {
  id: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  status: LeadStatus;
  industry: string;
  notes: string;
  dateAdded: string;
  lastContact: string;
  source: string;
  website?: string;
  employees?: string;
  revenue?: string;
  activityLog?: ActivityEntry[];
}

export type ClientStatus = 'active' | 'paused' | 'ended';

export const CLIENT_STATUS_CONFIG: Record<
  ClientStatus,
  { label: string; bg: string; text: string }
> = {
  active: { label: 'Active',  bg: 'bg-green-100',  text: 'text-green-700' },
  paused: { label: 'Paused',  bg: 'bg-yellow-100', text: 'text-yellow-700' },
  ended:  { label: 'Ended',   bg: 'bg-red-100',    text: 'text-red-700' },
};

export const SERVICE_OPTIONS = [
  'SEO',
  'Social Media Management',
  'Google Ads',
  'Facebook Ads',
  'Web Design',
  'Web Development',
  'Email Marketing',
  'Content Creation',
  'Branding',
  'Photography',
  'Video Production',
  'Consulting',
  'CRM Setup',
  'Analytics & Reporting',
  'Other',
];

export interface Client {
  id: string;
  leadId?: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  industry: string;
  monthlyRetainer: number;
  services: string[];
  contractStart: string;
  contractEnd?: string;
  status: ClientStatus;
  notes: string;
  dateAdded: string;
  website?: string;
}
