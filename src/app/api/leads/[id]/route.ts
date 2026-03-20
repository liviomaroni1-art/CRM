import { NextRequest, NextResponse } from 'next/server';
import { getLeads, saveLeads } from '@/lib/storage';

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
  leads[index] = { ...leads[index], ...body, id: params.id };
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
