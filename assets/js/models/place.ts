import { Screen } from "./screen";

export interface Place {
  id: string;
  name: string;
  description?: string;
  routes: string[];
  screens: Screen[];
  status: string;
}
