import { StaticTemplate } from "./static_template";

export interface PaMessage {
  id: number;
  alert_id: string | null;
  start_datetime: string;
  end_datetime: string | null;
  days_of_week: number[];
  sign_ids: string[];
  priority: number;
  interval_in_minutes: number;
  visual_text: string;
  audio_text: string;
  paused: boolean;
  saved: boolean;
  inserted_at: string;
  updated_at: string;
  message_type: MessageType;
  template_id: number | null;
}

export type MessageType = null | "psa" | "emergency";

export type NewPaMessageBody = Omit<
  PaMessage,
  "id" | "paused" | "saved" | "inserted_at" | "updated_at"
>;
export type UpdatePaMessageBody = Partial<PaMessage>;
