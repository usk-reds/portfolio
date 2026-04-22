export const ROUTES = {
  CREATE: '/',
  CREATED: '/created',
  DASHBOARD: '/event/:eventId',
} as const;

export function dashboardPath(eventId: string, token: string) {
  return `/event/${eventId}?token=${token}`;
}
