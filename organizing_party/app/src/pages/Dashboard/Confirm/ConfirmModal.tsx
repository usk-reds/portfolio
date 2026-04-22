import { useState, useRef, useEffect } from 'react';
import Modal from '../../../components/Modal/Modal';
import StepIndicator from '../../../components/StepIndicator/StepIndicator';
import Button from '../../../components/Button/Button';
import Input from '../../../components/Input/Input';
import CheckCircle from '../../../components/CheckCircle/CheckCircle';
import type { Event, Member } from '../../../types';
import { CORRECT_PASSWORD } from '../../../mock/event';
import styles from './ConfirmModal.module.css';

type Step = 'auth' | 'confirm' | 'done';
const STEPS: Step[] = ['auth', 'confirm', 'done'];

interface Props {
  open: boolean;
  onClose: () => void;
  event: Event;
  members: Member[];
}

export default function ConfirmModal({ open, onClose, event, members }: Props) {
  const [step, setStep] = useState<Step>('auth');
  const [password, setPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [shaking, setShaking] = useState(false);
  const [confirmedDateId, setConfirmedDateId] = useState('');
  const [confirmedVenueId, setConfirmedVenueId] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const attending = members.filter((m) => m.answered && m.attending);

  // 日時・店舗の得票計算
  const dateCounts = event.dateOptions.map((d) => ({
    ...d,
    count: attending.filter((m) => m.selectedDateIds?.includes(d.id)).length,
  }));
  const venueCounts = event.venues.map((v) => ({
    ...v,
    count: attending.filter((m) => m.selectedVenueId === v.id).length,
  }));
  const maxDate = Math.max(...dateCounts.map((d) => d.count));
  const maxVenue = Math.max(...venueCounts.map((v) => v.count));
  const topDates = dateCounts.filter((d) => d.count === maxDate);
  const topVenues = venueCounts.filter((v) => v.count === maxVenue);

  useEffect(() => {
    if (open && step === 'auth') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, step]);

  useEffect(() => {
    if (!open) return;
    if (step === 'confirm') {
      if (topDates.length === 1) setConfirmedDateId(topDates[0].id);
      if (topVenues.length === 1) setConfirmedVenueId(topVenues[0].id);
    }
  }, [step, open]);

  function handleAuth() {
    if (password === CORRECT_PASSWORD) {
      setPwError('');
      setStep('confirm');
    } else {
      setPwError('パスワードが正しくありません');
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  }

  function handleConfirm() {
    setStep('done');
  }

  function handleClose() {
    onClose();
    setTimeout(() => {
      setStep('auth');
      setPassword('');
      setPwError('');
      setConfirmedDateId('');
      setConfirmedVenueId('');
    }, 400);
  }

  const stepIndex = STEPS.indexOf(step);
  const confirmedDate = dateCounts.find((d) => d.id === confirmedDateId);
  const confirmedVenue = venueCounts.find((v) => v.id === confirmedVenueId);

  return (
    <Modal open={open} onClose={step === 'done' ? handleClose : onClose}>
      <StepIndicator current={stepIndex} total={3} />

      {step === 'auth' && (
        <>
          <div className={styles.lockIcon}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="5" y="13" width="18" height="12" rx="3" stroke="var(--text-sub)" strokeWidth="2" />
              <path d="M9 13V10a5 5 0 0 1 10 0v3" stroke="var(--text-sub)" strokeWidth="2" strokeLinecap="round" />
              <circle cx="14" cy="19" r="2" fill="var(--text-sub)" />
            </svg>
          </div>
          <h2 className={styles.heading}>幹事パスワードを入力</h2>
          <p className={styles.sub}>確定操作には認証が必要です</p>

          <div className={[styles.passwordWrap, shaking ? styles.shake : ''].join(' ')}>
            <Input
              ref={inputRef}
              passwordToggle
              placeholder="パスワードを入力"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAuth(); }}
              style={{ height: 48, fontSize: 15 }}
            />
          </div>
          {pwError && <p className={styles.errorMsg}>{pwError}</p>}
          <p className={styles.hintText}>ヒント：イベント作成時に設定したパスワード</p>

          <Button disabled={!password} onClick={handleAuth}>認証する</Button>
        </>
      )}

      {step === 'confirm' && (
        <>
          <div className={styles.authBadge}>✓ 幹事として認証済み</div>
          <h2 className={styles.heading}>日時・店舗を確定</h2>
          <p className={styles.sub}>参加者の希望を元に確定する内容を選択してください</p>

          {/* 日時選択 */}
          <div className={styles.confirmSection}>
            <p className={styles.confirmSectionTitle}>日時を確定</p>
            {(topDates.length === 1 ? topDates : dateCounts).map((d) => {
              const isTop = d.count === maxDate;
              return (
                <div
                  key={d.id}
                  className={[styles.selectRow, confirmedDateId === d.id ? styles.selected : ''].join(' ')}
                  onClick={() => setConfirmedDateId(d.id)}
                >
                  <div className={[styles.selectRadio, confirmedDateId === d.id ? styles.selected : ''].join(' ')}>
                    {confirmedDateId === d.id && <div className={styles.selectRadioDot} />}
                  </div>
                  <span className={styles.selectLabel}>{d.date} {d.time}</span>
                  <span className={[styles.votePill, isTop ? styles.top : ''].join(' ')}>
                    {isTop && topDates.length > 1 ? '同数' : isTop ? '最多' : ''} {d.count}人
                  </span>
                </div>
              );
            })}
          </div>

          {/* 店舗選択 */}
          <div className={styles.confirmSection}>
            <p className={styles.confirmSectionTitle}>店舗を確定</p>
            {(topVenues.length === 1 ? topVenues : venueCounts).map((v) => {
              const isTop = v.count === maxVenue;
              return (
                <div
                  key={v.id}
                  className={[styles.selectRow, confirmedVenueId === v.id ? styles.selected : ''].join(' ')}
                  onClick={() => setConfirmedVenueId(v.id)}
                >
                  <div className={[styles.selectRadio, confirmedVenueId === v.id ? styles.selected : ''].join(' ')}>
                    {confirmedVenueId === v.id && <div className={styles.selectRadioDot} />}
                  </div>
                  <span className={styles.selectLabel}>{v.name}</span>
                  <span className={[styles.votePill, isTop ? styles.top : ''].join(' ')}>
                    {isTop && topVenues.length > 1 ? '同数' : isTop ? '最多' : ''} {v.count}票
                  </span>
                </div>
              );
            })}
          </div>

          <Button disabled={!confirmedDateId || !confirmedVenueId} onClick={handleConfirm}>
            確定する
          </Button>
        </>
      )}

      {step === 'done' && (
        <>
          <div className={styles.doneWrap}>
            <CheckCircle />
            <h2 className={styles.doneHeading}>確定しました！</h2>
            <p className={styles.doneSub}>参加者に確定内容をお知らせください</p>
          </div>

          <div className={styles.doneSummaryCard}>
            <div className={styles.doneSummaryRow}>
              <span className={styles.doneSummaryKey}>日時</span>
              <span className={styles.doneSummaryVal}>
                {confirmedDate ? `${confirmedDate.date} ${confirmedDate.time}` : '-'}
              </span>
            </div>
            <div className={styles.doneSummaryRow}>
              <span className={styles.doneSummaryKey}>店舗</span>
              <span className={styles.doneSummaryVal}>{confirmedVenue?.name ?? '-'}</span>
            </div>
            <div className={styles.doneSummaryRow}>
              <span className={styles.doneSummaryKey}>参加人数</span>
              <span className={styles.doneSummaryVal}>{attending.length}人</span>
            </div>
          </div>

          <Button onClick={handleClose}>閉じる</Button>
        </>
      )}
    </Modal>
  );
}
