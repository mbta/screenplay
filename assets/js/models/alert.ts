export interface Alert {
  id: string;
  active_period: [Record<ActivePeriodLabel, string>];
}

type ActivePeriodLabel = "start" | "end";
