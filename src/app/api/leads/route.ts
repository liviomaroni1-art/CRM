import { NextRequest, NextResponse } from 'next/server';
import { getLeads, saveLeads } from '@/lib/storage';
import { Lead } from '@/lib/types';

export async function GET() {
  const leads = getLeads();
  return NextResponse.json(leads);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const leads = getLeads();
  const newLead: Lead = {
    businessName: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    lat: 0,
    lng: 0,
    status: 'new',
    industry: '',
    notes: '',
    dateAdded: new Date().toISOString(),
    lastContact: '',
    source: 'manual',
    ...body,
    id: `lead-${Date.now()}`,
    activityLog: [],
  };
  leads.push(newLead);
  saveLeads(leads);
  return NextResponse.json(newLead, { status: 201 });
}
