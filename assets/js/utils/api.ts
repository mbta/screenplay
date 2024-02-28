import { Alert } from "../models/alert";
import { Place } from "../models/place";
import { ScreenConfiguration } from "../models/screen_configuration";
import { ScreensByAlert } from "../models/screensByAlert";
import { PlaceIdsAndNewScreens } from "../components/Dashboard/PermanentConfiguration/Workflows/GlEink/ConfigureScreensPage";
import getCsrfToken from "../csrf";

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
