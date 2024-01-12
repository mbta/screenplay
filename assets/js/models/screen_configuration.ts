import { DirectionID } from "./direction_id";

interface Destination {
  route_id: string;
  direction_id?: DirectionID;
}

interface GlEinkAppParams {
  header: Destination;
  platform_location?: "front" | "back" | null;
}

export interface ScreenConfiguration {
  id: string;
  old_id?: string;
  app_params: GlEinkAppParams;
  is_live?: boolean;
  is_deleted?: boolean;
}
