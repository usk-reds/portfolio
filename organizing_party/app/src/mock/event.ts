import type { Event, Member } from '../types';

export const DUMMY_EVENT: Event = {
  id: 'ev_001',
  name: '3月の飲み会',
  deadline: '2026-03-15',
  organizerName: '山田太郎',
  dateOptions: [
    { id: 'd1', date: '2026-03-20', time: '19:00' },
    { id: 'd2', date: '2026-03-22', time: '19:30' },
    { id: 'd3', date: '2026-03-27', time: '18:30' },
  ],
  venues: [
    {
      id: 'v1',
      name: '炭火焼き鳥 鶴亀',
      url: 'https://example.com/tsurukame',
      note: '予算3,500円 / 和食',
      plans: [
        { id: 'p1', name: '飲み放題コース 3,500円' },
        { id: 'p2', name: 'プレミアムコース 5,000円' },
      ],
    },
    {
      id: 'v2',
      name: 'イタリアン VINO',
      url: 'https://example.com/vino',
      note: '予算4,000円 / イタリアン',
      plans: [
        { id: 'p3', name: 'スタンダードコース 4,000円' },
      ],
    },
  ],
};

export const DUMMY_MEMBERS: Member[] = [
  { id: 'm1', name: '田中 花子', answered: true, attending: true, selectedDateIds: ['d1', 'd2'], selectedVenueId: 'v1', note: 'アレルギーなし' },
  { id: 'm2', name: '鈴木 一郎', answered: true, attending: true, selectedDateIds: ['d1', 'd3'], selectedVenueId: 'v1', note: '' },
  { id: 'm3', name: '佐藤 美咲', answered: true, attending: true, selectedDateIds: ['d2'], selectedVenueId: 'v2', note: '魚介アレルギーあり' },
  { id: 'm4', name: '伊藤 健太', answered: true, attending: false, selectedDateIds: [], selectedVenueId: '', note: '' },
  { id: 'm5', name: '渡辺 さくら', answered: false },
  { id: 'm6', name: '山本 拓海', answered: false },
];

export const DUMMY_URL = 'https://nomikai.app/e/tk_8fGx2mKpQr';
export const CORRECT_PASSWORD = 'kanjipass';
