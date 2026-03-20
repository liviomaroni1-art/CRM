import { NextRequest, NextResponse } from 'next/server';
import { getClients, saveClients } from '@/lib/storage';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const clients = getClients();
  const client = clients.find((c) => c.id === params.id);
  if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(client);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json();
  const clients = getClients();
  const index = clients.findIndex((c) => c.id === params.id);
  if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  clients[index] = { ...clients[index], ...body, id: params.id };
  saveClients(clients);
  return NextResponse.json(clients[index]);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const clients = getClients();
  const filtered = clients.filter((c) => c.id !== params.id);
  if (filtered.length === clients.length)
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  saveClients(filtered);
  return NextResponse.json({ success: true });
}
