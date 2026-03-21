import { NextRequest, NextResponse } from 'next/server';
import { getLeads, saveLeads } from '@/lib/storage';
import { ActivityEntry, LeadStatus, LEAD_STATUS_CONFIG } from '@/lib/types';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const leads = getLeads();
  const lead = leads.find((l) => l.id === params.id);
  if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(lead);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json();
  const leads = getLeads();
  const index = leads.findIndex((l) => l.id === params.id);
  if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const existing = leads[index];
  const activityLog: ActivityEntry[] = existing.activityLog ?? [];

  // Auto-log status changes
  if (body.status && body.status !== existing.status) {
    activityLog.push({
      id: `act-${Date.now()}`,
      date: new Date().toISOString(),
      type: 'status_change',
      text: `Status changed from "${LEAD_STATUS_CONFIG[existing.status as LeadStatus].label}" to "${LEAD_STATUS_CONFIG[body.status as LeadStatus].label}"`,
    });
  }

  leads[index] = { ...existing, ...body, id: params.id, activityLog };
  saveLeads(leads);
  return NextResponse.json(leads[index]);
}

// Add an activity entry without touching other fields
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json();
  const leads = getLeads();
  const index = leads.findIndex((l) => l.id === params.id);
  if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const entry: ActivityEntry = {
    id: `act-${Date.now()}`,
    date: new Date().toISOString(),
    type: body.type ?? 'note',
    text: body.text ?? '',
  };

  const activityLog = [...(leads[index].activityLog ?? []), entry];
  leads[index] = { ...leads[index], activityLog };
  if (body.type === 'call' || body.type === 'meeting' || body.type === 'email') {
    leads[index].lastContact = entry.date;
  }
  saveLeads(leads);
  return NextResponse.json(leads[index]);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const leads = getLeads();
  const filtered = leads.filter((l) => l.id !== params.id);
  if (filtered.length === leads.length)
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  saveLeads(filtered);
  return NextResponse.json({ success: true });
}
