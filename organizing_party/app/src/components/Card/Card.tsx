import type { ReactNode } from 'react';
import styles from './Card.module.css';

interface Props {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className }: Props) {
  return <div className={[styles.card, className].filter(Boolean).join(' ')}>{children}</div>;
}
