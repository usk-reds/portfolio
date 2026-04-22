import type { ReactNode } from 'react';
import styles from './IOSDevice.module.css';

interface Props {
  children: ReactNode;
}

export default function IOSDevice({ children }: Props) {
  return <div className={styles.frame}>{children}</div>;
}
