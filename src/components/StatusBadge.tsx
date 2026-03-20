import { LEAD_STATUS_CONFIG, LeadStatus, CLIENT_STATUS_CONFIG, ClientStatus } from '@/lib/types';
import clsx from 'clsx';

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const cfg = LEAD_STATUS_CONFIG[status];
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', cfg.bg, cfg.text)}>
      <span
        className="w-1.5 h-1.5 rounded-full mr-1.5"
        style={{ backgroundColor: cfg.color }}
      />
      {cfg.label}
    </span>
  );
}

export function ClientStatusBadge({ status }: { status: ClientStatus }) {
  const cfg = CLIENT_STATUS_CONFIG[status];
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', cfg.bg, cfg.text)}>
      {cfg.label}
    </span>
  );
}
