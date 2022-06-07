import { Screen } from "./screen";

export interface Place {
  id: string;
  name: string;
  routes: string[];
  screens: Screen[];
  status: string;
}
