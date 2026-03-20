import { NextRequest, NextResponse } from 'next/server';
import { getClients, saveClients } from '@/lib/storage';
import { Client } from '@/lib/types';

export async function GET() {
  const clients = getClients();
  return NextResponse.json(clients);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const clients = getClients();
  const newClient: Client = {
    businessName: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    industry: '',
    monthlyRetainer: 0,
    services: [],
    contractStart: new Date().toISOString().split('T')[0],
    status: 'active',
    notes: '',
    dateAdded: new Date().toISOString(),
    ...body,
    id: `client-${Date.now()}`,
  };
  clients.push(newClient);
  saveClients(clients);
  return NextResponse.json(newClient, { status: 201 });
}
