import fs from 'fs';
import path from 'path';
import { Lead, Client } from './types';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const CLIENTS_FILE = path.join(DATA_DIR, 'clients.json');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getLeads(): Lead[] {
  ensureDir();
  if (!fs.existsSync(LEADS_FILE)) {
    fs.writeFileSync(LEADS_FILE, '[]');
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

export function saveLeads(leads: Lead[]): void {
  ensureDir();
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
}

export function getClients(): Client[] {
  ensureDir();
  if (!fs.existsSync(CLIENTS_FILE)) {
    fs.writeFileSync(CLIENTS_FILE, '[]');
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(CLIENTS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

export function saveClients(clients: Client[]): void {
  ensureDir();
  fs.writeFileSync(CLIENTS_FILE, JSON.stringify(clients, null, 2));
}
