import { Alert } from "../models/alert";
import { Place } from "../models/place";
import { ScreensByAlert } from "../models/screensByAlert";

export const fetchPlaces = () => {
  return fetch("/api/dashboard")
    .then((response) => response.json())
    .then((placeList: Place[]) => {
      return placeList;
    });
};

interface AlertsResponse {
  alerts: Alert[];
  screens_by_alert: ScreensByAlert;
}

export const fetchAlerts = () => {
  return fetch("/api/alerts")
    .then((response) => response.json())
    .then(({ alerts, screens_by_alert }: AlertsResponse) => {
      return { alerts, screens_by_alert };
    });
};
