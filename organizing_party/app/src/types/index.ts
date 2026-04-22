export interface DateOption {
  id: string;
  date: string;
  time: string;
}

export interface VenuePlan {
  id: string;
  name: string;
}

export interface Venue {
  id: string;
  name: string;
  url: string;
  note: string;
  plans: VenuePlan[];
}

export interface Event {
  id: string;
  name: string;
  deadline: string;
  organizerName: string;
  dateOptions: DateOption[];
  venues: Venue[];
}

export interface Answer {
  id: string;
  memberName: string;
  attending: boolean;
  selectedDateIds: string[];
  selectedVenueId: string;
  note: string;
}

export interface Member {
  id: string;
  name: string;
  answered: boolean;
  attending?: boolean;
  selectedDateIds?: string[];
  selectedVenueId?: string;
  note?: string;
}

export type TabKey = 'answer' | 'status';
export type ConfirmStep = 'auth' | 'confirm' | 'done';
