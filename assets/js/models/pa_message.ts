export interface PaMessage {
  id?: number;
  alert_id: string | null;
  start_time: string;
  end_time: string | null;
  days_of_week: number[];
  sign_ids: string[];
  priority: number;
  interval_in_minutes: number;
  visual_text: string;
  audio_text: string;
  paused?: boolean;
  saved?: boolean;
  inserted_at?: string;
}
