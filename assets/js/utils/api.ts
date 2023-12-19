import { Alert } from "../models/alert";
import { Place } from "../models/place";
import { ScreensByAlert } from "../models/screensByAlert";
import { ScreenConfiguration } from "../models/screen_configuration";

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

interface ExistingScreensResponse {
  live_screens: ScreenConfiguration[];
  pending_screens: ScreenConfiguration[];
}

export const fetchExistingScreens = (
  placeId: string,
  appId: string,
  callback: (
    live_screens: ScreenConfiguration[],
    pending_screens: ScreenConfiguration[]
  ) => void
) => {
  return fetch(`/config/existing-screens/${placeId}/${appId}`)
    .then((response) => response.json())
    .then(({ live_screens, pending_screens }: ExistingScreensResponse) => {
      callback(live_screens, pending_screens);
    });
};
