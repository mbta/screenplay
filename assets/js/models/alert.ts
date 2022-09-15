interface InformedEntity {
  stop: string;
  route: string;
  route_type: number;
}

export interface ActivePeriod {
  start: string;
  end: string;
}

export interface Alert {
  id: string;
  effect: string;
  severity: string;
  header: string;
  informed_entities: InformedEntity[];
  active_period: ActivePeriod[];
  lifecycle: string;
  timeframe: string;
  created_at: string;
  updated_at: string;
}
