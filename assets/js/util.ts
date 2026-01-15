import { BASE_ROUTE_NAME_TO_ROUTE_IDS } from "Constants/constants";
import {
  CannedMessage,
  CustomMessage,
  StationsByLine,
} from "./components/OutfrontTakeoverTool/OutfrontTakeoverTool";
import CANNED_MESSAGES from "Constants/messages";
import STATION_ORDER_BY_LINE from "Constants/stationOrder";
import { Alert, ActivePeriod } from "Models/alert";
import { Place } from "Models/place";
import { Screen } from "Models/screen";
import { ScreensByAlert } from "Models/screensByAlert";
import moment from "moment";
import fp from "lodash/fp";
import { StaticTemplate } from "Models/static_template";

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
    case "sl1":
    case "sl2":
    case "sl3":
    case "sl4":
    case "sl5":
    case "slw":
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
    ].some((line) => affectedList.includes(line))
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

export const matchStation = (
  station: string,
  stationScreenOrientationList: StationsByLine,
) => {
  const result = Object.values(stationScreenOrientationList)
    .flat()
    .find(({ name }) => name === station);
  if (result === undefined) {
    throw new TypeError(
      `Station ${station} not present in list of all stations!`,
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
  // @ts-expect-error work around loose typing
  if (message.id !== undefined) return CANNED_MESSAGES[parseInt(message.id)];
  // @ts-expect-error work around loose typing
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

// Filters out screens that don't have the alert, then filters out places with empty
// screens array
export const placesWithSelectedAlert = (
  alert: Alert | null,
  places: Place[],
  screensByAlertMap: ScreensByAlert,
) => {
  return alert
    ? places
        .map((place) => ({
          ...place,
          screens: place.screens.filter((screen) =>
            screensByAlertMap[alert.id].includes(screen.id),
          ),
        }))
        .filter((place) => place.screens.length > 0)
    : [];
};

export const signsByDirection = (signs: Screen[]) => {
  const groupedSigns = fp.groupBy((sign) => {
    const directionIds = sign.routes?.map((r) => r.direction_id);
    if (fp.intersection(directionIds, [0, 1]).length === 2) {
      return "middle";
    } else if (directionIds?.includes(0)) {
      return "left";
    } else {
      return "right";
    }
  }, signs);

  return {
    left: groupedSigns["left"] ?? [],
    middle: groupedSigns["middle"] ?? [],
    right: groupedSigns["right"] ?? [],
  };
};

const screenTypeOrder = [
  "dup_v2",
  "busway_v2",
  "bus_shelter_v2",
  "bus_eink_v2",
  "gl_eink_v2",
  "pre_fare_v2",
  "elevator_v2",
  "pa_ess",
];

export const sortScreens = (screenList: Screen[]) => {
  return screenList.sort((a, b) =>
    screenTypeOrder.indexOf(a.type) >= screenTypeOrder.indexOf(b.type) ? 1 : -1,
  );
};

export const sortByStationOrder = (
  places: Place[],
  filteredLine: string,
  reverse?: boolean,
) => {
  const stationOrder = STATION_ORDER_BY_LINE[filteredLine.toLowerCase()];

  if (!stationOrder) return places;

  const stationOrderToIndex = Object.fromEntries(
    stationOrder.map((station, i) => [station.name.toLowerCase(), i]),
  );

  const placesByStationOrder = places.map((place) => ({
    place,
    index: stationOrderToIndex[place.name.toLowerCase()],
  }));

  const sortedPlaces = placesByStationOrder
    .sort(({ index: i1 }, { index: i2 }) => i1 - i2)
    .map(({ place }) => place);

  return reverse ? sortedPlaces.reverse() : sortedPlaces;
};

export const capitalizeTerminalStops = (
  stationName: string,
  filteredLine: string | null | undefined,
) => {
  let isTerminalStop = false;

  // If a filter is present, only look at stations for that filter.
  // This will prevent multi-route stops from being capitalized unless they are a terminal stop of the current filtered line.
  if (filteredLine) {
    const line = STATION_ORDER_BY_LINE[filteredLine.toLowerCase()];
    const terminalStops = line.filter((line) => line.isTerminalStop);
    isTerminalStop = terminalStops.some((stop) => stationName === stop.name);
  }
  // If there is no filtered line, look through all lines to find terminal stops.
  // If a station is a terminal stop for any line, it will be capitalized.
  else {
    isTerminalStop = Object.keys(STATION_ORDER_BY_LINE)
      .filter((key) => !["silver", "mattapan"].includes(key))
      .some((key) => {
        const line = STATION_ORDER_BY_LINE[key];
        const terminalStops = line.filter((line) => line.isTerminalStop);
        return terminalStops.some((stop) => stationName === stop.name);
      });
  }

  return isTerminalStop ? stationName.toUpperCase() : stationName;
};

export const capitalize = (str: string) => {
  if (str.length <= 1) {
    return str.toUpperCase();
  } else {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
};

export const getAlertEarliestStartLatestEnd = (
  activePeriods: ActivePeriod[],
) => {
  const starts = activePeriods.map((activePeriod) => {
    return new Date(activePeriod.start).getTime();
  });

  const ends = activePeriods.map((activePeriod) => {
    return new Date(activePeriod.end).getTime();
  });
  const earliestStart = Math.min(...starts);
  const latestEnd = Math.max(...ends);

  const start = moment(earliestStart).format("l LT");

  const end =
    latestEnd === 0 ? "later today" : moment(latestEnd).format("l LT");

  return [start, end];
};

export const allRouteIdsAtPlaces = (places: Place[]) => {
  return fp.uniq(
    places.flatMap((place) => place.screens.flatMap(getRouteIdsForSign)),
  );
};

export const busRouteIdsAtPlaces = (places: Place[]) => {
  return fp.without(
    Object.values(BASE_ROUTE_NAME_TO_ROUTE_IDS).flat(),
    allRouteIdsAtPlaces(places),
  );
};

export const getZoneLabel = (zone: string) => {
  switch (zone) {
    case "m":
      return "Mezzanine";
    case "c":
      return "Center";
    case "n":
      return "Northbound";
    case "s":
      return "Southbound";
    case "e":
      return "Eastbound";
    case "w":
      return "Westbound";
    default:
      return "";
  }
};

export const signIDs = (signs: Screen[]) => signs.map((sign) => sign.id);

export const getPlacesFromFilter = (
  places: Place[],
  filterFn: (routeId: string) => boolean,
) => {
  return places.filter((place) =>
    place.screens.some((screen) => getRouteIdsForSign(screen).some(filterFn)),
  );
};

export const getRouteIdsForSign = (screen: Screen) =>
  screen.routes ? screen.routes.map((route) => route.id) : [];

export const sortRoutes = (routes: string[]) => {
  const routeOrder = [
    "Green",
    "Green-B",
    "Green-C",
    "Green-D",
    "Green-E",
    "Red",
    "Orange",
    "Blue",
    "Mattapan",
    "Silver",
    "Bus",
  ];

  return routes.sort((a, b) => routeOrder.indexOf(a) - routeOrder.indexOf(b));
};

export const templateTypeLabel = (template: StaticTemplate): string =>
  template.audio_url ? "Prerecorded Audio" : "Text to Speech";
