import { Screen } from "./screen";

export interface Place {
    id: string;
    name: string;
    modesAndLines: string[];
    screens: Screen[];
    status: string;
}