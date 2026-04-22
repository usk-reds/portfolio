import styles from './CheckCircle.module.css';

interface Props {
  size?: 'sm' | 'md';
}

export default function CheckCircle({ size = 'md' }: Props) {
  return (
    <div className={[styles.circle, size === 'sm' ? styles.sm : ''].join(' ')}>
      <svg
        width={size === 'sm' ? 32 : 40}
        height={size === 'sm' ? 32 : 40}
        viewBox="0 0 40 40"
        fill="none"
      >
        <polyline
          className={styles.check}
          points="8,20 16,29 32,12"
          stroke="#fff"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
