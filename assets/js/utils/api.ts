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
): Promise<{ places_and_screens: ExistingScreens, version_id: string }> => {
  const response = await fetch(
    `/config/existing-screens/${appId}?place_ids=${placeIds.join(",")}`
  );

  return await response.json();
};

export interface PendingAndLiveScreensResponse {
  places_and_screens: PendingAndLiveScreens;
  version_id: string;
  last_modified_ms: number | null;
}

// Very similar to the `ExistingScreens` interface, except:
// 1. key is a string that combines place and app ID, and
// 2. place and app IDs are added to each `ExistingScreensAtPlace` object, so that we don't have to parse them from the combined string.
export interface PendingAndLiveScreens {
  [placeAndAppID: string]: ExistingScreensAtPlace & { place_id: string, app_id: string }
}

export const fetchExistingScreensAtPlacesWithPendingScreens = async (): Promise<PendingAndLiveScreensResponse> => {
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

export const publishScreensForPlace = async (placeId: string, appId: string, versionId: string, hiddenFromScreenplayIds: string[]) => {
  const response = await fetch(`/config/publish/${placeId}/${appId}`, {
    method: "POST",
    body: JSON.stringify({
      version_id: versionId,
      hidden_from_screenplay_ids: hiddenFromScreenplayIds
    }),
    headers: {
      "content-type": "application/json",
      "x-csrf-token":
        document?.head?.querySelector<HTMLMetaElement>(
          "[name~=csrf-token][content]"
        )?.content ?? "",
    },
    credentials: "include",
  });

  let message;
  // Guard against unexpectedly long response bodies,
  // e.g. when an exception is raised on the server
  if (!response.headers.get("Content-Type")?.includes("text/html")) {
    message = await response.text();
  }

  return { status: response.status, message };
};
