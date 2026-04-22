import styles from './AddRemoveBtn.module.css';

interface AddBtnProps {
  label: string;
  enabled: boolean;
  onClick: () => void;
}

export function AddBtn({ label, enabled, onClick }: AddBtnProps) {
  return (
    <button
      type="button"
      className={[styles.addBtn, enabled ? styles.enabled : ''].join(' ')}
      onClick={enabled ? onClick : undefined}
    >
      <span>＋</span>
      <span>{label}</span>
    </button>
  );
}

interface RemoveBtnProps {
  onClick: () => void;
}

export function RemoveBtn({ onClick }: RemoveBtnProps) {
  return (
    <button type="button" className={styles.removeBtn} onClick={onClick} aria-label="削除">
      <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="2" y1="2" x2="12" y2="12" />
        <line x1="12" y1="2" x2="2" y2="12" />
      </svg>
    </button>
  );
}
