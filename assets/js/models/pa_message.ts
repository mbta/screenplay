export interface PaMessage {
  id: number;
  sign_ids: string[];
  priority: number;
  interval_in_minutes: number;
  visual_text: string;
  audio_text: string;
  start_time: string;
  end_time: string;
  inserted_at: string;
}
