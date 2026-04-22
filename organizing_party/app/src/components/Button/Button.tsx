import type { ReactNode, ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

type Variant = 'primary' | 'dark' | 'ghost' | 'danger';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

export default function Button({ variant = 'primary', className, children, ...rest }: Props) {
  return (
    <button
      className={[styles.btn, styles[variant], className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </button>
  );
}
