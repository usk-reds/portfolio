import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import IOSDevice from '../../components/IOSDevice/IOSDevice';
import Button from '../../components/Button/Button';
import CheckCircle from '../../components/CheckCircle/CheckCircle';
import type { Event } from '../../types';
import { DUMMY_EVENT, DUMMY_URL } from '../../mock/event';
import { dashboardPath } from '../../routes';
import styles from './CreatedPage.module.css';

interface LocationState {
  event?: Event;
  url?: string;
  token?: string;
  eventId?: string;
}

export default function CreatedPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as LocationState) ?? {};

  const event: Event = state.event ?? DUMMY_EVENT;
  const url = state.url ?? DUMMY_URL;
  const eventId = state.eventId ?? event.id;
  const token = state.token ?? 'dummy';

  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('コピーできませんでした。URLを手動でコピーしてください。');
    }
  }

  return (
    <IOSDevice>
      <div className={styles.page}>
        <div className={styles.topBand} />

        <div className={styles.body}>
          <div className={[styles.hero, visible ? styles.visible : ''].join(' ')}>
            <CheckCircle />
            <h1 className={styles.heading}>イベントを作成しました</h1>
            <p className={styles.sub}>参加者に以下のURLを共有してください</p>
          </div>

          <div className={[styles.urlCard, visible ? styles.visible : ''].join(' ')}>
            <p className={styles.urlLabel}>参加者用URL</p>
            <div className={styles.urlBox}>
              <span className={styles.urlText}>{url}</span>
              <button
                className={[styles.copyBtn, copied ? styles.copied : ''].join(' ')}
                onClick={handleCopy}
              >
                {copied ? '✓ コピー済' : 'コピー'}
              </button>
            </div>
          </div>

          <div className={[styles.hintBox, visible ? styles.visible : ''].join(' ')}>
            💡 このURLが唯一のアクセス手段です。幹事自身もブックマークを推奨します。社内ツール等で参加者全員に共有してください。
          </div>

          <div className={[styles.summaryCard, visible ? styles.visible : ''].join(' ')}>
            <p className={styles.summaryTitle}>イベント概要</p>
            <div className={styles.summaryRow}>
              <span className={styles.summaryKey}>イベント名</span>
              <span className={styles.summaryVal}>{event.name}</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryKey}>回答期限</span>
              <span className={styles.summaryVal}>{event.deadline}</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryKey}>日時候補</span>
              <span className={styles.summaryVal}>
                {event.dateOptions.map((d) => `${d.date} ${d.time}`).join('、')}
              </span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryKey}>候補店舗</span>
              <span className={styles.summaryVal}>
                {event.venues.map((v) => v.name).join('、')}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <Button onClick={() => navigate(dashboardPath(eventId, token))}>
            ダッシュボードへ
          </Button>
        </div>
      </div>
    </IOSDevice>
  );
}
