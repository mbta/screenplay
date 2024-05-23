export interface PaMessage {
  id: number;
  sign_ids: String[];
  priority: number;
  interval_in_minutes: number;
  visual_text: String;
  audio_text: String;
  start_time: Date;
  end_time: Date;
  inserted_at: Date;
}
