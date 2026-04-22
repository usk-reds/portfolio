import type { ReactNode } from 'react';
import styles from './Label.module.css';

interface Props {
  children: ReactNode;
  required?: boolean;
}

export default function Label({ children, required }: Props) {
  return (
    <div className={styles.wrap}>
      <span className={styles.text}>{children}</span>
      {required && <span className={styles.badge}>必須</span>}
    </div>
  );
}
