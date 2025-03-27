export interface ServiceRecord {
  route: string;
  place_id: string;
  direction_id: 0 | 1;
  type: "start" | "end" | "mid";
}
