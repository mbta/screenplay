import { Alert } from "../models/alert";
import { Place } from "../models/place";
import { ScreensByAlert } from "../models/screensByAlert";
import { PlaceIdsAndScreens } from "../components/Dashboard/PermanentConfiguration/Workflows/GlEink/ConfigureScreensPage";
import getCsrfToken from "../csrf";

export const fetchPlaces = (callback: (places: Place[]) => void) => {
  return fetch("/api/dashboard")
    .then((response) => response.json())
    .then((placesList: Place[]) => {
      callback(placesList);
    });
};

interface AlertsResponse {
  all_alert_ids: string[];
  alerts: Alert[];
  screens_by_alert: ScreensByAlert;
}

export const fetchAlerts = (
  callback: (
    all_alert_ids: string[],
    alerts: Alert[],
    screens_by_alert: ScreensByAlert
  ) => void
) => {
  return fetch("/api/alerts")
    .then((response) => response.json())
    .then(({ all_alert_ids, alerts, screens_by_alert }: AlertsResponse) => {
      callback(all_alert_ids, alerts, screens_by_alert);
    });
};

export const fetchExistingScreens = (
  appId: string,
  placeIds: string[],
  callback: (places_and_screens: PlaceIdsAndScreens, etag: string) => void
) => {
  return fetch(
    `/config/existing-screens/${appId}?place_ids=${placeIds.join(",")}`
  )
    .then((response) => response.json())
    .then(({ places_and_screens, etag }) => {
      callback(places_and_screens, etag);
    });
};

export const putPendingScreens = (
  placesAndScreens: PlaceIdsAndScreens,
  screenType: "gl_eink_v2" | null,
  etag: string,
  callback: () => void
) => {
  return fetch("/config/put", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-csrf-token": getCsrfToken(),
    },
    credentials: "include",
    body: JSON.stringify({
      places_and_screens: placesAndScreens,
      screen_type: screenType,
      etag: etag,
    }),
  }).then(() => callback());
};
