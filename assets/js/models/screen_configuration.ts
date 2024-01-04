import { DirectionID } from "./direction_id";

interface Destination {
  route_id: string;
  direction_id?: DirectionID;
}

interface GlEinkAppParams {
  header: Destination;
  plaform_location?: "front" | "back" | null;
}

export interface ScreenConfiguration {
  id: string;
  app_params: GlEinkAppParams;
}
