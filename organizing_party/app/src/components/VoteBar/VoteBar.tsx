import styles from './VoteBar.module.css';

interface BarItem {
  id: string;
  label: string;
  count: number;
}

interface Props {
  items: BarItem[];
}

export default function VoteBar({ items }: Props) {
  const max = Math.max(...items.map((i) => i.count), 1);
  const topCount = Math.max(...items.map((i) => i.count));

  return (
    <>
      {items.map((item) => (
        <div key={item.id} className={styles.item}>
          <div className={styles.header}>
            <span className={styles.labelText}>{item.label}</span>
            <span className={styles.count}>{item.count}人</span>
          </div>
          <div className={styles.track}>
            <div
              className={[styles.fill, item.count === topCount && topCount > 0 ? styles.top : styles.other].join(' ')}
              style={{ width: `${(item.count / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </>
  );
}
