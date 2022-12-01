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
  severity_string: string;
  header: string;
  informed_entities: InformedEntity[];
  active_period: ActivePeriod[];
  created_at: string;
  updated_at: string;
  affected_list: string[];
}
