import { DirectionID } from "./direction_id";

interface Destination {
  route_id: "green_b" | "green_c" | "green_d" | "green_e";
  direction_id: DirectionID;
}

interface GlEinkAppParams {
  header: Destination;
}

export interface ScreenConfiguration {
  id: string;
  app_params: GlEinkAppParams;
}
