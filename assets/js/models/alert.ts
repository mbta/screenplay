import { DirectionID } from "./direction_id";
import { RouteType } from "./route_type";

export interface InformedEntity {
  direction_id: DirectionID | null;
  facility: string | null;
  route: string | null;
  route_type: RouteType | null;
  stop: string | null;
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
