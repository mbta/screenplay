export interface LineStop {
  line: string;
  stop_id: string;
  direction_id: 0 | 1;
  suppression_type: "terminal" | "stop" | null;
}
