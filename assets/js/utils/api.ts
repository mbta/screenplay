import { Alert } from "../models/alert";
import { Place } from "../models/place";
import { ScreensByAlert } from "../models/screensByAlert";

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

export const fetchExistingScreens = async (
  appId: string,
  placeIds: string[]
) => {
  const response = await fetch(
    `/config/existing-screens/${appId}?place_ids=${placeIds.join(",")}`
  );

  return await response.json();
};
