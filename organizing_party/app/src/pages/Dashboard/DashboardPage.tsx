import { useState } from 'react';
import { useParams } from 'react-router-dom';
import IOSDevice from '../../components/IOSDevice/IOSDevice';
import EventBanner from '../../components/EventBanner/EventBanner';
import AnswerTab from './AnswerTab';
import StatusTab from './StatusTab';
import ConfirmModal from './Confirm/ConfirmModal';
import { DUMMY_EVENT, DUMMY_MEMBERS } from '../../mock/event';
import type { TabKey } from '../../types';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  useParams<{ eventId: string }>();

  const event = DUMMY_EVENT;
  const members = DUMMY_MEMBERS;

  const [tab, setTab] = useState<TabKey>('answer');
  const [modalOpen, setModalOpen] = useState(false);

  // デモ用：期限切れを強制するには true にする
  const isPastDeadline = true;

  return (
    <IOSDevice>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.eventTitle}>{event.name}</h1>
          <div className={styles.tabBar}>
            <button
              className={[styles.tabBtn, tab === 'answer' ? styles.active : ''].join(' ')}
              onClick={() => setTab('answer')}
            >
              回答
            </button>
            <button
              className={[styles.tabBtn, tab === 'status' ? styles.active : ''].join(' ')}
              onClick={() => setTab('status')}
            >
              状況
            </button>
          </div>
        </div>

        <div className={styles.body}>
          <EventBanner name={event.name} deadline={event.deadline} />
          {tab === 'answer' ? (
            <AnswerTab event={event} />
          ) : (
            <StatusTab
              event={event}
              members={members}
              isPastDeadline={isPastDeadline}
              onConfirm={() => setModalOpen(true)}
            />
          )}
        </div>
      </div>

      <ConfirmModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        event={event}
        members={members}
      />
    </IOSDevice>
  );
}
