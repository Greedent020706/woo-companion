import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import type { StatusTone } from '@woo/shared';
import styles from './ToneBadge.module.css';

type ToneBadgeProps = {
  tone: StatusTone;
  icon: LucideIcon;
  children: ReactNode;
};

export function ToneBadge({ tone, icon: Icon, children }: ToneBadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[tone]}`} data-tone={tone}>
      <Icon aria-hidden="true" size={14} strokeWidth={2.5} />
      {children}
    </span>
  );
}
