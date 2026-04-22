import Button from '../../components/Button/Button';
import VoteBar from '../../components/VoteBar/VoteBar';
import type { Event, Member } from '../../types';
import styles from './StatusTab.module.css';

interface Props {
  event: Event;
  members: Member[];
  isPastDeadline: boolean;
  onConfirm: () => void;
}

export default function StatusTab({ event, members, isPastDeadline, onConfirm }: Props) {
  const answered = members.filter((m) => m.answered);
  const attending = answered.filter((m) => m.attending);
  const notAttending = answered.filter((m) => !m.attending);

  const dateBars = event.dateOptions.map((d) => ({
    id: d.id,
    label: `${d.date} ${d.time}`,
    count: attending.filter((m) => m.selectedDateIds?.includes(d.id)).length,
  }));

  const venueBars = event.venues.map((v) => ({
    id: v.id,
    label: v.name,
    count: attending.filter((m) => m.selectedVenueId === v.id).length,
  }));

  return (
    <div className={styles.body}>
      {/* 回答状況サマリー */}
      <div className={styles.section}>
        <p className={styles.sectionTitle}>回答状況</p>
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCell}>
            <span className={styles.summaryNum}>{answered.length}/{members.length}</span>
            <span className={styles.summaryLabel}>回答済み</span>
          </div>
          <div className={styles.summaryCell}>
            <span className={styles.summaryNum} style={{ color: 'var(--success)' }}>{attending.length}</span>
            <span className={styles.summaryLabel}>参加</span>
          </div>
          <div className={styles.summaryCell}>
            <span className={styles.summaryNum} style={{ color: 'var(--danger)' }}>{notAttending.length}</span>
            <span className={styles.summaryLabel}>不参加</span>
          </div>
        </div>
      </div>

      {/* 日時集計 */}
      <div className={styles.section}>
        <p className={styles.sectionTitle}>日時ごとの参加可能人数</p>
        <VoteBar items={dateBars} />
      </div>

      {/* 店舗集計 */}
      <div className={styles.section}>
        <p className={styles.sectionTitle}>店舗ごとの希望票数</p>
        <VoteBar items={venueBars} />
      </div>

      {/* 参加者一覧 */}
      <div className={styles.section}>
        <p className={styles.sectionTitle}>参加者一覧</p>
        {members.map((m) => (
          <div key={m.id} className={styles.memberRow}>
            <div className={[styles.avatar, !m.answered ? styles.unanswered : ''].join(' ')}>
              {m.name.charAt(0)}
            </div>
            <div className={styles.memberInfo}>
              <span className={[styles.memberName, !m.answered ? styles.unanswered : ''].join(' ')}>
                {m.name}
              </span>
              {m.answered ? (
                <span className={[styles.memberStatus, m.attending ? styles.attending : styles.notAttending].join(' ')}>
                  {m.attending ? '参加' : '不参加'}
                </span>
              ) : (
                <span className={[styles.memberStatus, styles.pending].join(' ')}>未回答</span>
              )}
              {m.note && <p className={styles.memberNote}>💬 {m.note}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* 確定ボタン（期限後のみ） */}
      {isPastDeadline && (
        <div className={styles.footer}>
          <Button variant="dark" onClick={onConfirm}>
            ✓　確定へ進む
          </Button>
          <p className={styles.footerNote}>回答期限を過ぎたため確定が可能になりました</p>
        </div>
      )}
    </div>
  );
}
