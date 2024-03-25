export const SILVER_LINE_ROUTES = ["741", "742", "743", "746", "749", "751"];

const BASE_MODES_AND_LINES = [
  { label: "All MODES", ids: ["All"] },
  { label: "Red Line", ids: ["Red"], color: "#DA291C" },
  { label: "Orange Line", ids: ["Orange"], color: "#ED8B00" },
  {
    label: "Green Line",
    ids: ["Green-B", "Green-C", "Green-D", "Green-E"],
    color: "#00843D",
  },
  { label: "Green Line B", ids: ["Green-B"], color: "#00843D" },
  { label: "Green Line C", ids: ["Green-C"], color: "#00843D" },
  { label: "Green Line D", ids: ["Green-D"], color: "#00843D" },
  { label: "Green Line E", ids: ["Green-E"], color: "#00843D" },
  { label: "Blue Line", ids: ["Blue"], color: "#003DA5" },
  { label: "Mattapan", ids: ["Mattapan"], color: "#DA291C" },
  {
    ids: ["Silver", ...SILVER_LINE_ROUTES],
    label: "Silver Line",
    color: "#7C878E",
  },
  { label: "Bus", ids: ["Bus"], color: "#FFC72C" },
  { label: "Commuter Rail", ids: ["CR"], color: "#80276C" },
  { label: "Ferry", ids: ["Ferry"], color: "#008EAA" },
];

export const PLACES_PAGE_MODES_AND_LINES = BASE_MODES_AND_LINES;

export const ALERTS_PAGE_MODES_AND_LINES = [
  ...BASE_MODES_AND_LINES,
  { label: "Access", ids: ["Access"], color: "#165C96" },
];

export const SORT_LABELS: Record<string, [string, string]> = {
  Blue: ["WESTBOUND", "EASTBOUND"],
  Green: ["WESTBOUND", "EASTBOUND"],
  Orange: ["SOUTHBOUND", "NORTHBOUND"],
  Red: ["SOUTHBOUND", "NORTHBOUND"],
  Mattapan: ["OUTBOUND", "INBOUND"],
  Alerts: ["END", "END"],
};

export const SCREEN_TYPES: { label: string; ids: string[] }[] = [
  { label: "All SCREEN TYPES", ids: ["All"] },
  { label: "Bus Shelter", ids: ["bus_shelter_v2"] },
  { label: "DUP", ids: ["dup", "dup_v2"] },
  { label: "E-Ink: Bus", ids: ["bus_eink", "bus_eink_v2"] },
  {
    label: "E-Ink: Green Line",
    ids: ["gl_eink_single", "gl_eink_double", "gl_eink_v2"],
  },
  { label: "Elevator", ids: ["elevator"] },
  { label: "PA ESS", ids: ["pa_ess"] },
  { label: "Pre Fare Duo", ids: ["pre_fare_v2"] },
  { label: "Triptych", ids: ["triptych_v2"] },
  { label: "Solari", ids: ["solari"] },
];

export const STATUSES = [
  { label: "Any STATUS", ids: ["Any"] },
  { label: "Auto", ids: ["Auto"] },
  { label: "Headway mode", ids: ["Headway"] },
  { label: "Overrides", ids: ["Overrides"] },
  { label: "Emergency", ids: ["Takeovers"] },
  { label: "Errors", ids: ["Errors"] },
  { label: "Screen off", ids: ["Off"] },
];
