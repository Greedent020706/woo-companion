import type { ReactNode } from 'react';
import styles from './SurfaceCard.module.css';

type SurfaceCardProps = {
  title?: string;
  children: ReactNode;
  className?: string;
};

export function SurfaceCard({ title, children, className = '' }: SurfaceCardProps) {
  return (
    <section className={`${styles.card} ${className}`}>
      {title && <h2 className={styles.title}>{title}</h2>}
      {children}
    </section>
  );
}
