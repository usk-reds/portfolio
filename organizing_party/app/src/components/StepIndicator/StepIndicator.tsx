import styles from './StepIndicator.module.css';

interface Props {
  current: number; // 0-based
  total: number;
}

export default function StepIndicator({ current, total }: Props) {
  return (
    <div className={styles.wrap}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
          <div
            className={[
              styles.step,
              i < current ? styles.done : i === current ? styles.active : '',
            ].join(' ')}
          >
            {i < current ? (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="2,6 5,9 10,3" />
              </svg>
            ) : (
              i + 1
            )}
          </div>
          {i < total - 1 && (
            <div className={[styles.line, i < current ? styles.done : ''].join(' ')} />
          )}
        </div>
      ))}
    </div>
  );
}
