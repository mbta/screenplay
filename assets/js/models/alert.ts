export interface Alert {
  id: string;
  attributes: {
    active_period: ActivePeriod[];
    informed_entity: InformedEntity[];
  };
}
interface ActivePeriod {
  start: string;
  end: string | null;
}

interface InformedEntity {
  route: string;
  route_type: number;
  stop: string;
}
