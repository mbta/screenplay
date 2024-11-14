import { type MessageType } from "./pa_message";

export interface StaticTemplate {
  title: string;
  visual_text: string;
  audio_text: string;
  type: MessageType;
}
