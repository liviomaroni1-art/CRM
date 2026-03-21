import fs from 'fs';
import path from 'path';
import { Lead, Client } from './types';

// On Vercel, the filesystem is read-only except for /tmp.
// We copy seed data to /tmp on first access and read/write from there.
const isVercel = !!process.env.VERCEL;
const TMP_DIR = '/tmp/crm-data';
const SEED_DIR = path.join(process.cwd(), 'src', 'data');

const DATA_DIR = isVercel ? TMP_DIR : SEED_DIR;
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const CLIENTS_FILE = path.join(DATA_DIR, 'clients.json');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function seedIfMissing(file: string, seedName: string) {
  if (!fs.existsSync(file)) {
    const seedFile = path.join(SEED_DIR, seedName);
    if (fs.existsSync(seedFile)) {
      fs.copyFileSync(seedFile, file);
    } else {
      fs.writeFileSync(file, '[]');
    }
  }
}

export function getLeads(): Lead[] {
  ensureDir();
  if (isVercel) seedIfMissing(LEADS_FILE, 'leads.json');
  if (!fs.existsSync(LEADS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

export function saveLeads(leads: Lead[]): void {
  ensureDir();
  try {
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
  } catch {
    // On serverless, writes may not persist — this is expected
  }
}

export function getClients(): Client[] {
  ensureDir();
  if (isVercel) seedIfMissing(CLIENTS_FILE, 'clients.json');
  if (!fs.existsSync(CLIENTS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(CLIENTS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

export function saveClients(clients: Client[]): void {
  ensureDir();
  try {
    fs.writeFileSync(CLIENTS_FILE, JSON.stringify(clients, null, 2));
  } catch {
    // On serverless, writes may not persist — this is expected
  }
}
