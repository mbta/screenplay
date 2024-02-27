import { Alert } from "../models/alert";
import { Place } from "../models/place";
import { ScreensByAlert } from "../models/screensByAlert";
import { PlaceIdsAndNewScreens } from "../components/Dashboard/PermanentConfiguration/Workflows/GlEink/ConfigureScreensPage";
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

export const fetchExistingScreens = async (
  appId: string,
  placeIds: string[]
) => {
  const response = await fetch(
    `/config/existing-screens/${appId}?place_ids=${placeIds.join(",")}`
  );

  return await response.json();
};

export const putPendingScreens = async (
  placesAndScreens: PlaceIdsAndNewScreens,
  screenType: "gl_eink_v2" | null,
  version_id: string
) => {
  return await fetch("/config/put", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-csrf-token": getCsrfToken(),
    },
    credentials: "include",
    body: JSON.stringify({
      places_and_screens: placesAndScreens,
      screen_type: screenType,
      version_id: version_id,
    }),
  });
};

export const publishScreensForPlace = async (placeId: string) => {
  const response = await fetch(`/config/publish/${placeId}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-csrf-token":
        document?.head?.querySelector<HTMLMetaElement>(
          "[name~=csrf-token][content]"
        )?.content ?? "",
    },
    credentials: "include",
  });

  return response.statusText;
};
