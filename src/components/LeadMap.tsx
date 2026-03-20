'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Lead, LeadStatus, LEAD_STATUS_CONFIG } from '@/lib/types';
import { Search, Loader2, Building2, Phone, Mail, MapPin, Plus, X, Globe } from 'lucide-react';
import AddLeadModal from './AddLeadModal';

interface Props {
  leads: Lead[];
  onLeadUpdated: () => void;
}

interface OverpassBusiness {
  id: number;
  lat: number;
  lon: number;
  tags: Record<string, string>;
}

// We lazy-import Leaflet only on client
let L: typeof import('leaflet') | null = null;

function createMarkerIcon(color: string, size = 14) {
  if (!L) return undefined;
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};
      border:2px solid white;
      border-radius:50%;
      box-shadow:0 2px 6px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 4],
  });
}

function createBusinessIcon() {
  if (!L) return undefined;
  return L.divIcon({
    className: '',
    html: `<div style="
      width:12px;height:12px;
      background:#3B82F6;
      border:2px solid white;
      border-radius:3px;
      box-shadow:0 2px 6px rgba(0,0,0,0.4);
      opacity:0.85;
    "></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [0, -10],
  });
}

export default function LeadMap({ leads, onLeadUpdated }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import('leaflet').Map | null>(null);
  const markersRef = useRef<import('leaflet').Marker[]>([]);
  const bizMarkersRef = useRef<import('leaflet').Marker[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [bizLoading, setBizLoading] = useState(false);
  const [businesses, setBusinesses] = useState<OverpassBusiness[]>([]);
  const [addLeadData, setAddLeadData] = useState<Partial<Lead> | null>(null);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');

  // Init map
  useEffect(() => {
    if (mapInstanceRef.current || !mapRef.current) return;
    import('leaflet').then((leaflet) => {
      L = leaflet;
      // Fix default icons
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = leaflet.map(mapRef.current!, {
        center: [52.52, 13.405],
        zoom: 13,
        zoomControl: true,
      });

      leaflet
        .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        })
        .addTo(map);

      mapInstanceRef.current = map;
    });

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update lead markers
  useEffect(() => {
    if (!mapInstanceRef.current || !L) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const filtered = statusFilter === 'all' ? leads : leads.filter((l) => l.status === statusFilter);

    filtered.forEach((lead) => {
      if (!lead.lat || !lead.lng || !L) return;
      const cfg = LEAD_STATUS_CONFIG[lead.status];
      const icon = createMarkerIcon(cfg.color, 16);
      if (!icon) return;

      const marker = L.marker([lead.lat, lead.lng], { icon });
      marker.addTo(mapInstanceRef.current!);

      const popup = L.popup({ maxWidth: 300 }).setContent(buildLeadPopup(lead));
      marker.bindPopup(popup);

      markersRef.current.push(marker);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leads, statusFilter]);

  // Update biz markers
  useEffect(() => {
    if (!mapInstanceRef.current || !L) return;
    bizMarkersRef.current.forEach((m) => m.remove());
    bizMarkersRef.current = [];

    businesses.forEach((biz) => {
      if (!L) return;
      const icon = createBusinessIcon();
      if (!icon) return;
      const marker = L.marker([biz.lat, biz.lon], { icon });
      marker.addTo(mapInstanceRef.current!);

      const alreadyLead = leads.find(
        (l) => Math.abs(l.lat - biz.lat) < 0.0001 && Math.abs(l.lng - biz.lon) < 0.0001
      );

      const name = biz.tags.name || biz.tags['name:en'] || 'Unknown Business';
      const type = biz.tags.shop || biz.tags.amenity || biz.tags.office || 'Business';

      const container = document.createElement('div');
      container.innerHTML = `
        <div class="p-3">
          <div class="flex items-start justify-between mb-2">
            <div>
              <p class="font-semibold text-gray-900 text-sm">${name}</p>
              <p class="text-xs text-gray-500 capitalize">${type}</p>
            </div>
            ${alreadyLead ? `<span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">In CRM</span>` : ''}
          </div>
          ${biz.tags['addr:street'] ? `<p class="text-xs text-gray-600 mb-2">📍 ${biz.tags['addr:street']} ${biz.tags['addr:housenumber'] || ''}</p>` : ''}
          ${biz.tags.phone ? `<p class="text-xs text-gray-600 mb-2">📞 ${biz.tags.phone}</p>` : ''}
          ${biz.tags.website ? `<p class="text-xs text-gray-600 mb-2">🌐 ${biz.tags.website}</p>` : ''}
          ${
            !alreadyLead
              ? `<button id="add-biz-${biz.id}" class="w-full mt-2 bg-blue-600 text-white text-xs py-1.5 px-3 rounded-lg hover:bg-blue-700 transition">+ Add as Lead</button>`
              : ''
          }
        </div>
      `;

      if (!alreadyLead) {
        const btn = container.querySelector(`#add-biz-${biz.id}`);
        btn?.addEventListener('click', () => {
          setAddLeadData({
            businessName: name,
            industry: type,
            address: biz.tags['addr:street']
              ? `${biz.tags['addr:street']} ${biz.tags['addr:housenumber'] || ''}`
              : '',
            phone: biz.tags.phone || '',
            website: biz.tags.website || '',
            lat: biz.lat,
            lng: biz.lon,
          });
        });
      }

      marker.bindPopup(L.popup({ maxWidth: 300 }).setContent(container));
      bizMarkersRef.current.push(marker);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businesses, leads]);

  const buildLeadPopup = (lead: Lead) => {
    const cfg = LEAD_STATUS_CONFIG[lead.status];
    const container = document.createElement('div');
    container.innerHTML = `
      <div class="p-3">
        <div class="flex items-start justify-between mb-3">
          <div class="flex-1">
            <p class="font-bold text-gray-900 text-sm">${lead.businessName}</p>
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1" style="background:${cfg.color}22;color:${cfg.color}">
              ● ${cfg.label}
            </span>
          </div>
        </div>
        ${lead.contactPerson ? `<p class="text-xs text-gray-700 mb-1">👤 ${lead.contactPerson}</p>` : ''}
        ${lead.phone ? `<p class="text-xs text-gray-700 mb-1">📞 ${lead.phone}</p>` : ''}
        ${lead.email ? `<p class="text-xs text-gray-700 mb-1">✉️ ${lead.email}</p>` : ''}
        ${lead.address ? `<p class="text-xs text-gray-700 mb-1">📍 ${lead.address}</p>` : ''}
        ${lead.industry ? `<p class="text-xs text-gray-500 mb-2">🏢 ${lead.industry}</p>` : ''}
        ${lead.notes ? `<p class="text-xs text-gray-600 italic border-t pt-2 mt-2">"${lead.notes.substring(0, 80)}${lead.notes.length > 80 ? '...' : ''}"</p>` : ''}
        <a href="/leads?id=${lead.id}" class="block w-full mt-3 text-center bg-slate-800 text-white text-xs py-1.5 px-3 rounded-lg hover:bg-slate-700 transition">
          Open Lead →
        </a>
      </div>
    `;
    return container;
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !mapInstanceRef.current) return;
    setSearchLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (data[0]) {
        mapInstanceRef.current.setView([parseFloat(data[0].lat), parseFloat(data[0].lon)], 15);
      }
    } catch {
      // ignore
    }
    setSearchLoading(false);
  };

  const findBusinessesInArea = useCallback(async () => {
    if (!mapInstanceRef.current) return;
    setBizLoading(true);
    setBusinesses([]);
    const bounds = mapInstanceRef.current.getBounds();
    const bbox = `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`;
    const query = `[out:json][timeout:20];(node["name"]["shop"](${bbox});node["name"]["office"](${bbox});node["name"]["amenity"~"restaurant|cafe|bar|pub|gym|pharmacy|dentist|doctor|hotel|beauty"](${bbox}););out body;`;
    try {
      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query,
      });
      const data = await res.json();
      setBusinesses((data.elements || []).slice(0, 80));
    } catch {
      alert('Failed to fetch businesses. Please try again.');
    }
    setBizLoading(false);
  }, []);

  const clearBusinesses = () => {
    setBusinesses([]);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="p-3 bg-white border-b flex flex-wrap gap-2 items-center">
        {/* Address search */}
        <div className="flex gap-2 flex-1 min-w-48">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-8 pr-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search address or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={searchLoading}
            className="px-3 py-1.5 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700 disabled:opacity-50 flex items-center gap-1"
          >
            {searchLoading ? <Loader2 size={14} className="animate-spin" /> : 'Go'}
          </button>
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as LeadStatus | 'all')}
          className="text-sm border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All statuses</option>
          {Object.entries(LEAD_STATUS_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>

        {/* Find biz */}
        <button
          onClick={findBusinessesInArea}
          disabled={bizLoading}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5"
        >
          {bizLoading ? <Loader2 size={14} className="animate-spin" /> : <Building2 size={14} />}
          {bizLoading ? 'Searching...' : 'Find Businesses'}
        </button>

        {businesses.length > 0 && (
          <button
            onClick={clearBusinesses}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 flex items-center gap-1"
          >
            <X size={14} /> Clear ({businesses.length})
          </button>
        )}
      </div>

      {/* Legend */}
      <div className="px-3 py-2 bg-white border-b flex flex-wrap gap-3 text-xs text-gray-600">
        {Object.entries(LEAD_STATUS_CONFIG).map(([k, v]) => (
          <span key={k} className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full border border-white shadow-sm" style={{ background: v.color }} />
            {v.label}
          </span>
        ))}
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded bg-blue-500 border border-white shadow-sm opacity-85" />
          Found Business
        </span>
      </div>

      {/* Map */}
      <div ref={mapRef} className="flex-1" style={{ minHeight: 400 }} />

      {/* Add Lead Modal */}
      {addLeadData && (
        <AddLeadModal
          initialData={addLeadData}
          onClose={() => setAddLeadData(null)}
          onSaved={() => {
            setAddLeadData(null);
            onLeadUpdated();
          }}
        />
      )}
    </div>
  );
}
