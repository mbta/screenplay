import { DirectionID } from "./direction_id";

interface Destination {
  route_id: "green_b" | "green_c" | "green_d" | "green_e";
  direction_id: DirectionID;
}

interface GlEinkConfig {
  app_params: {
    header: Destination;
  };
}

export interface ScreenConfiguration {
  [id: string]: GlEinkConfig;
}
