import {
  CannedMessage,
  CustomMessage,
} from "./components/OutfrontTakeoverTool/OutfrontTakeoverTool";
import CANNED_MESSAGES from "./constants/messages";
import STATIONS_BY_LINE from "./constants/stations";
import { Alert } from "./models/alert";
import { Place } from "./models/place";
import { ScreensByAlert } from "./models/screensByAlert";
import { Screen } from "./models/screen";

export const color = (line: string) => {
  switch (line) {
    case "red":
    case "mattapan":
      return "#DA291C";
    case "orange":
      return "#ED8B00";
    case "blue":
      return "#003DA5";
    case "silver":
      return "#7C878E";
    case "green":
    case "green-b":
    case "green-c":
    case "green-d":
    case "green-e":
      return "#00843D";
    default:
      return "#FFFFFF";
  }
};

export const abbreviation = (line: string) => {
  switch (line) {
    case "red":
      return "RL";
    case "orange":
      return "OL";
    case "blue":
      return "BL";
    case "silver":
      return "SL";
    case "green":
      return "GL";
  }
};

export const translateRouteID = (id: string) => {
  switch (id) {
    case "red":
      return "Red Line";
    case "mattapan":
      return "Mattapan";
    case "orange":
      return "Orange Line";
    case "blue":
      return "Blue Line";
    case "silver":
      return "Silver Line";
    case "green":
    case "green-b":
    case "green-c":
    case "green-d":
    case "green-e":
      return "Green Line";
    case "bus":
      return "Bus";
    case "cr":
      return "Commuter Rail";
    default:
      return "";
  }
};

export const getModeFromAffectedList = (affectedList: string[]) => {
  if (
    [
      "red",
      "orange",
      "blue",
      "green",
      "green-b",
      "green-c",
      "green-d",
      "green-e",
    ].filter((value) => affectedList.includes(value))
  ) {
    return "subway";
  } else {
    return affectedList[0];
  }
};

export const convertArrayToListString = (array: string[]) => {
  if (array.length === 1) {
    return array[0];
  } else if (array.length === 2) {
    return `${array[0]} and ${array[1]}`;
  } else {
    return (
      array.slice(0, array.length - 1).join(", ") +
      `and ${array[array.length - 1]}`
    );
  }
};

const ALL_STATIONS = ["blue", "green", "orange", "red", "silver"].flatMap(
  (line) => STATIONS_BY_LINE[line]
);

export const matchStation = (station: string) => {
  const result = ALL_STATIONS.find(({ name }) => name === station);
  if (result === undefined) {
    throw new TypeError(
      `Station ${station} not present in list of all stations!`
    );
  }
  return result;
};

export const formatDate = (date: Date) => {
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "long",
    day: "numeric",
  });
};

export const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat(undefined, {
    timeStyle: "short",
  }).format(date);
};

export const getMessageString = (message: CannedMessage | CustomMessage) => {
  // @ts-ignore
  if (message.id !== undefined) return CANNED_MESSAGES[parseInt(message.id)];
  // @ts-ignore
  else return message.text;
};

export const classWithModifier = (baseClass: string, modifier: string) => {
  return `${baseClass} ${baseClass}--${modifier}`;
};

export const formatEffect = (effect: string) => {
  return effect
    .toLowerCase()
    .split("_")
    .map((str: string) => str[0].toUpperCase() + str.substring(1))
    .join(" ");
};

export const placesWithSelectedAlert = (
  alert: Alert | null,
  places: Place[],
  screensByAlertMap: ScreensByAlert
) => {
  return alert
    ? places.filter((place) =>
        place.screens.some((screen: Screen) =>
          screensByAlertMap[alert.id].includes(screen.id)
        )
      )
    : [];
};
