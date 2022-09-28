import {
  CannedMessage,
  CustomMessage,
} from "./components/OutfrontTakeoverTool/OutfrontTakeoverTool";
import CANNED_MESSAGES from "./constants/messages";
import STATIONS_BY_LINE from "./constants/stations";

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
