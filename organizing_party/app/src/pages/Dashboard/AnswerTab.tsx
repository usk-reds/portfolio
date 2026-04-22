import { useState } from 'react';
import Label from '../../components/Label/Label';
import Input from '../../components/Input/Input';
import Textarea from '../../components/Textarea/Textarea';
import Button from '../../components/Button/Button';
import CheckCircle from '../../components/CheckCircle/CheckCircle';
import type { Event } from '../../types';
import styles from './AnswerTab.module.css';

interface Props {
  event: Event;
}

export default function AnswerTab({ event }: Props) {
  const [memberName, setMemberName] = useState('');
  const [attending, setAttending] = useState<boolean | null>(null);
  const [selectedDateIds, setSelectedDateIds] = useState<string[]>([]);
  const [selectedVenueId, setSelectedVenueId] = useState('');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [nameError, setNameError] = useState('');

  function toggleDate(id: string) {
    setSelectedDateIds((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  }

  function handleSubmit() {
    if (!memberName.trim()) {
      setNameError('名前を入力してください');
      return;
    }
    setNameError('');
    setSubmitted(true);
  }

  function handleReset() {
    setMemberName('');
    setAttending(null);
    setSelectedDateIds([]);
    setSelectedVenueId('');
    setNote('');
    setSubmitted(false);
  }

  if (submitted) {
    return (
      <div>
        <div className={styles.successWrap}>
          <CheckCircle />
          <h2 className={styles.successHeading}>回答しました</h2>
          <p className={styles.successSub}>{memberName} さんの回答を受け付けました</p>
        </div>
        <div style={{ padding: '0 16px' }}>
          <Button variant="ghost" onClick={handleReset}>
            別の名前で回答する
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* お名前 */}
      <div className={styles.section} style={{ marginTop: 12 }}>
        <p className={styles.sectionTitle}>お名前</p>
        <Label required>名前</Label>
        <Input
          placeholder="例：田中 花子"
          value={memberName}
          onChange={(e) => setMemberName(e.target.value)}
          error={nameError}
        />
      </div>

      {/* 参加可否 */}
      <div className={styles.section}>
        <p className={styles.sectionTitle}>参加可否</p>
        <div className={styles.attendGrid}>
          <button
            type="button"
            className={[styles.attendBtn, attending === true ? styles.selectedYes : ''].join(' ')}
            onClick={() => setAttending(true)}
          >
            参加
          </button>
          <button
            type="button"
            className={[styles.attendBtn, attending === false ? styles.selectedNo : ''].join(' ')}
            onClick={() => setAttending(false)}
          >
            不参加
          </button>
        </div>
      </div>

      {/* 参加の場合のみ表示 */}
      {attending === true && (
        <>
          {/* 日時選択 */}
          <div className={styles.section}>
            <p className={styles.sectionTitle}>参加できる日時</p>
            {event.dateOptions.map((d) => (
              <div
                key={d.id}
                className={styles.checkRow}
                onClick={() => toggleDate(d.id)}
              >
                <div className={[styles.checkBox, selectedDateIds.includes(d.id) ? styles.checked : ''].join(' ')}>
                  {selectedDateIds.includes(d.id) && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="2,6 5,9 10,3" />
                    </svg>
                  )}
                </div>
                <span className={styles.checkLabel}>{d.date} {d.time}</span>
              </div>
            ))}
          </div>

          {/* 店舗選択 */}
          <div className={styles.section}>
            <p className={styles.sectionTitle}>希望店舗</p>
            {event.venues.map((v) => (
              <div key={v.id} className={styles.radioRow} onClick={() => setSelectedVenueId(v.id)}>
                <div className={[styles.radioCircle, selectedVenueId === v.id ? styles.selected : ''].join(' ')}>
                  {selectedVenueId === v.id && <div className={styles.radioDot} />}
                </div>
                <div className={styles.radioLabel}>
                  <p className={styles.radioName}>{v.name}</p>
                  {v.note && <p className={styles.radioNote}>{v.note}</p>}
                  {v.url && (
                    <div className={styles.venueCard}>
                      <p className={styles.venueCardName}>{v.name}</p>
                      {v.plans.length > 0 && (
                        <div className={styles.venuePlans}>
                          {v.plans.map((p) => <div key={p.id}>・{p.name}</div>)}
                        </div>
                      )}
                      {v.url && <a className={styles.venueCardLink} href={v.url} target="_blank" rel="noopener noreferrer">地図・詳細を見る</a>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 特記事項 */}
          <div className={styles.section}>
            <p className={styles.sectionTitle}>特記事項</p>
            <Label>アレルギー・メモ（任意）</Label>
            <Textarea
              rows={3}
              placeholder="例：魚介アレルギーあり"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </>
      )}

      <div className={styles.footer}>
        <Button
          disabled={attending === null}
          onClick={handleSubmit}
        >
          回答する
        </Button>
      </div>
    </div>
  );
}
