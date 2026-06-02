export type TemplateType = "psa" | "emergency";

export interface StaticTemplate {
  id: number;
  title: string;
  visual_text: string;
  audio_text?: string;
  audio_text_has_ssml?: boolean;
  audio_url?: string;
  type: TemplateType;
  archived: boolean;
}
