export interface Alert {
  id: string;
  active_period: ActivePeriod[];
}
interface ActivePeriod {
  start: string;
  end: string | null;
}
