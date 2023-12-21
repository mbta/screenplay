import { Alert } from "../models/alert";
import { Place } from "../models/place";
import { ScreensByAlert } from "../models/screensByAlert";
import { ExistingScreens } from "../components/Dashboard/PermanentConfiguration/Workflows/GlEink/ConfigureScreensWorkflowPage";

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
  callback: (places_and_screens: ExistingScreens) => void
) => {
  return fetch(
    `/config/existing-screens/${appId}?place_ids=${placeIds.join(",")}`
  )
    .then((response) => response.json())
    .then((places_and_screens: ExistingScreens) => {
      callback(places_and_screens);
    });
};
