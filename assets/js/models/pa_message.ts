export interface PaMessage {
  id: number;
  sign_ids: string[];
  priority: number;
  interval_in_minutes: number;
  visual_text: string;
  audio_text: string;
  start_time: Date;
  end_time: Date;
  inserted_at: Date;
}
