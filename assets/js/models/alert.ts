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

/**
 * Describes an Alert retrieved from the V3 API.
 *
 * Any properties that are added/removed, or have their type(s) changed should be reflected in
 * {@link isAlert}
 */
export interface Alert {
  id: string;
  effect: string;
  severity: number;
  severity_string: string;
  header: string;
  informed_entities: InformedEntity[];
  active_period: ActivePeriod[];
  created_at: string;
  updated_at: string;
  affected_list: string[];
}

/**
 * Type guard for determining if the provided argument is an {@link Alert}.
 * @param val The value to test
 * @returns `true` if `val` is an `Alert`, `false` otherwise.
 */
export const isAlert = (val: unknown): val is Alert => {
  return (
    typeof val === "object" &&
    val !== null &&
    "id" in val &&
    typeof val.id === "string" &&
    "effect" in val &&
    typeof val.effect === "string" &&
    "severity" in val &&
    typeof val.severity === "number" &&
    "severity_string" in val &&
    typeof val.severity_string === "string" &&
    "header" in val &&
    typeof val.header === "string" &&
    "informed_entities" in val &&
    Array.isArray(val.informed_entities) &&
    "active_period" in val &&
    Array.isArray(val.active_period) &&
    "created_at" in val &&
    typeof val.created_at === "string" &&
    "updated_at" in val &&
    typeof val.updated_at === "string" &&
    "affected_list" in val &&
    Array.isArray(val.affected_list)
  );
};
