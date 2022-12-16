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
  alerts: Alert[];
  screens_by_alert: ScreensByAlert;
}

export const fetchAlerts = (
  callback: (alerts: Alert[], screens_by_alert: ScreensByAlert) => void
) => {
  return fetch("/api/alerts")
    .then((response) => response.json())
    .then(({ alerts, screens_by_alert }: AlertsResponse) => {
      callback(alerts, screens_by_alert);
    });
};
