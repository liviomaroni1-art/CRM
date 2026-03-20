'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, MapPin, BarChart3, Briefcase, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

const nav = [
  { href: '/',        label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/leads',   label: 'Leads',      icon: MapPin },
  { href: '/clients', label: 'Clients',    icon: Briefcase },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-slate-900 text-white flex flex-col shrink-0">
      <div className="px-6 py-5 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Users size={16} />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">ProCRM</p>
            <p className="text-xs text-slate-400">Lead & Client System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={14} />}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-slate-700">
        <p className="text-xs text-slate-500 text-center">ProCRM v1.0</p>
      </div>
    </aside>
  );
}
