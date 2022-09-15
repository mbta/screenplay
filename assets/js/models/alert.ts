export interface Alert {
  id: string;
  active_period: Record<ActivePeriodLabel, string | null>[];
}

type ActivePeriodLabel = "start" | "end";
