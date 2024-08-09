import { z } from "zod";

export const paMessageSchema = z.object({
  id: z.number(),
  sign_ids: z.array(z.string()),
  priority: z.number(),
  interval_in_minutes: z.number(),
  visual_text: z.string(),
  audio_text: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  inserted_at: z.string(),
});

export type PaMessage = z.infer<typeof paMessageSchema>;
