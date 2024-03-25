import { DirectionID } from "./direction_id";

interface Destination {
  route_id: string;
  direction_id?: DirectionID;
}

interface GlEinkAppParams {
  header: Destination;
  platform_location?: "front" | "back" | null;
}

export interface GLScreenConfiguration {
  screen_id?: string;
  new_id?: string;
  app_params: GlEinkAppParams;
  app_id: string;
  is_live?: boolean;
  is_deleted?: boolean;
}

export type ScreenConfiguration = GLScreenConfiguration;
// | More configuration shapes to be added here as we support them
