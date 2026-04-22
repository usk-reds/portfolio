import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import IOSDevice from '../../components/IOSDevice/IOSDevice';
import Button from '../../components/Button/Button';
import Label from '../../components/Label/Label';
import Input from '../../components/Input/Input';
import { AddBtn, RemoveBtn } from '../../components/AddRemoveBtn/AddRemoveBtn';
import type { DateOption, Venue } from '../../types';
import styles from './CreateEventPage.module.css';

function uid() { return crypto.randomUUID(); }

interface Errors {
  name?: string;
  deadline?: string;
  password?: string;
  dates?: Record<string, { date?: string; time?: string }>;
  venues?: Record<string, { name?: string }>;
}

export default function CreateEventPage() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [deadline, setDeadline] = useState('');
  const [organizerName, setOrganizerName] = useState('');
  const [password, setPassword] = useState('');
  const [dates, setDates] = useState<DateOption[]>([{ id: uid(), date: '', time: '' }]);
  const [venues, setVenues] = useState<Venue[]>([{ id: uid(), name: '', url: '', note: '', plans: [] }]);
  const [errors, setErrors] = useState<Errors>({});

  function validate(): boolean {
    const e: Errors = {};
    if (!name.trim()) e.name = 'イベント名を入力してください';
    if (!deadline) e.deadline = '回答期限を選択してください';
    if (!password.trim()) e.password = 'パスワードを入力してください';

    const dateErrs: Record<string, { date?: string; time?: string }> = {};
    dates.forEach((d) => {
      const de: { date?: string; time?: string } = {};
      if (!d.date) de.date = '日付を入力してください';
      if (!d.time) de.time = '時間を入力してください';
      if (Object.keys(de).length) dateErrs[d.id] = de;
    });
    if (Object.keys(dateErrs).length) e.dates = dateErrs;

    const venueErrs: Record<string, { name?: string }> = {};
    venues.forEach((v) => {
      if (!v.name.trim()) venueErrs[v.id] = { name: '店名を入力してください' };
    });
    if (Object.keys(venueErrs).length) e.venues = venueErrs;

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    const eventId = uid();
    const token = 'tk_' + Math.random().toString(36).slice(2, 12);
    navigate('/created', {
      state: {
        event: { id: eventId, name, deadline, organizerName, dateOptions: dates, venues },
        url: `https://nomikai.app/e/${token}`,
        token,
        eventId,
      },
    });
  }

  function addDate() {
    if (dates.length >= 3) return;
    setDates([...dates, { id: uid(), date: '', time: '' }]);
  }

  function removeDate(id: string) {
    setDates(dates.filter((d) => d.id !== id));
  }

  function updateDate(id: string, field: 'date' | 'time', value: string) {
    setDates(dates.map((d) => (d.id === id ? { ...d, [field]: value } : d)));
  }

  function addVenue() {
    if (venues.length >= 3) return;
    setVenues([...venues, { id: uid(), name: '', url: '', note: '', plans: [] }]);
  }

  function removeVenue(id: string) {
    setVenues(venues.filter((v) => v.id !== id));
  }

  function updateVenue(id: string, field: keyof Omit<Venue, 'id' | 'plans'>, value: string) {
    setVenues(venues.map((v) => (v.id === id ? { ...v, [field]: value } : v)));
  }

  return (
    <IOSDevice>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>イベント作成</h1>
        </div>

        <div className={styles.body}>
          {/* 基本情報 */}
          <div className={styles.section}>
            <p className={styles.sectionTitle}>基本情報</p>

            <div className={styles.field}>
              <Label required>イベント名</Label>
              <Input
                placeholder="例：3月の飲み会"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
              />
            </div>

            <div className={styles.field}>
              <Label required>回答期限</Label>
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                error={errors.deadline}
              />
            </div>

            <div className={styles.field}>
              <Label>幹事名</Label>
              <Input
                placeholder="任意"
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
              />
            </div>

            <div className={styles.field} style={{ marginBottom: 0 }}>
              <Label required>幹事パスワード</Label>
              <Input
                passwordToggle
                placeholder="確定操作時に使用"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
              />
            </div>
          </div>

          {/* 日時候補 */}
          <div className={styles.section}>
            <p className={styles.sectionTitle}>日時候補</p>
            {dates.map((d, i) => (
              <div key={d.id} className={styles.dateItem}>
                <div className={styles.dateRow}>
                  <input
                    type="date"
                    value={d.date}
                    onChange={(e) => updateDate(d.id, 'date', e.target.value)}
                    className={errors.dates?.[d.id]?.date ? styles.inputError : ''}
                  />
                  <input
                    type="time"
                    value={d.time}
                    onChange={(e) => updateDate(d.id, 'time', e.target.value)}
                    className={errors.dates?.[d.id]?.time ? styles.inputError : ''}
                  />
                  {i > 0 && <RemoveBtn onClick={() => removeDate(d.id)} />}
                </div>
                {(errors.dates?.[d.id]?.date || errors.dates?.[d.id]?.time) && (
                  <p className={styles.errorMsg}>日付と時間を入力してください</p>
                )}
              </div>
            ))}
            <AddBtn label="候補を追加" enabled={dates.length < 3} onClick={addDate} />
          </div>

          {/* 候補店舗 */}
          <div className={styles.section}>
            <p className={styles.sectionTitle}>候補店舗</p>
            {venues.map((v, i) => (
              <div key={v.id} className={styles.venueItem}>
                <div className={styles.venueHeader}>
                  <span className={styles.venueNumber}>店舗 {i + 1}</span>
                  {i > 0 && <RemoveBtn onClick={() => removeVenue(v.id)} />}
                </div>
                <div className={styles.venueFields}>
                  <div>
                    <Label required>店名</Label>
                    <Input
                      placeholder="例：炭火焼き鳥 鶴亀"
                      value={v.name}
                      onChange={(e) => updateVenue(v.id, 'name', e.target.value)}
                      error={errors.venues?.[v.id]?.name}
                    />
                  </div>
                  <div>
                    <Label>URL・住所</Label>
                    <Input
                      placeholder="任意"
                      value={v.url}
                      onChange={(e) => updateVenue(v.id, 'url', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>備考</Label>
                    <Input
                      placeholder="例：予算3,500円、和食"
                      value={v.note}
                      onChange={(e) => updateVenue(v.id, 'note', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
            <AddBtn label="店舗を追加" enabled={venues.length < 3} onClick={addVenue} />
          </div>
        </div>

        <div className={styles.footer}>
          <Button onClick={handleSubmit}>作成する</Button>
        </div>
      </div>
    </IOSDevice>
  );
}
