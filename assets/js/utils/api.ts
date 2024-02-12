import { Alert } from "../models/alert";
import { Place } from "../models/place";
import { ScreenConfiguration } from "../models/screen_configuration";
import { ScreensByAlert } from "../models/screensByAlert";

export const fetchPlaces = async (): Promise<Place[]> => {
  const response = await fetch("/api/dashboard");
  return await response.json();
};

interface AlertsResponse {
  all_alert_ids: string[];
  alerts: Alert[];
  screens_by_alert: ScreensByAlert;
}

export const fetchAlerts = async (): Promise<AlertsResponse> => {
  const response = await fetch("/api/alerts");
  return await response.json();
};

export interface ExistingScreens {
  [place_id: string]: ExistingScreensAtPlace;
}

export interface ExistingScreensAtPlace {
  live_screens?: { [screen_id: string]: ScreenConfiguration };
  pending_screens: { [screen_id: string]: ScreenConfiguration };
}

export const fetchExistingScreens = async (
  appId: string,
  placeIds: string[]
): Promise<{ places_and_screens: ExistingScreens, etag: string }> => {
  const response = await fetch(
    `/config/existing-screens/${appId}?place_ids=${placeIds.join(",")}`
  );

  return await response.json();
};

export const fetchExistingScreensAtPlacesWithPendingScreens = async (): Promise<ExistingScreens> => {
  const response = await fetch("/config/existing-screens-at-places-with-pending-screens");
  return await response.json();
};
