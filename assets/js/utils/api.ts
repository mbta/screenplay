import fp from "lodash/fp";
import { Alert } from "../models/alert";
import { Place } from "../models/place";
import { ScreenConfiguration } from "../models/screen_configuration";
import { ScreensByAlert } from "../models/screensByAlert";
import { PlaceIdsAndNewScreens } from "../components/Dashboard/PermanentConfiguration/Workflows/GlEink/ConfigureScreensPage";
import getCsrfToken from "../csrf";
import { NewPaMessageBody, UpdatePaMessageBody } from "Models/pa_message";
import { SuppressedPrediction } from "Models/suppressed_prediction";

export const fetchPlaces = async (): Promise<Place[]> => {
  const response = await fetch("/api/dashboard");
  return await response.json();
};

export const fetchLineStops = async () => {
  const response = await fetch("/api/line_stops");
  const { data } = await response.json();
  return data;
};

interface AlertsResponse {
  all_alert_ids: string[];
  alerts: Alert[];
  screens_by_alert: ScreensByAlert;
}

export const fetchAlerts = async (): Promise<AlertsResponse> => {
  const response = await fetch("/api/alerts");
  if (response.status === 200) {
    return await response.json();
  } else {
    throw response;
  }
};

export const fetchActiveAndFutureAlerts = async (): Promise<AlertsResponse> => {
  const response = await fetch("/api/alerts/non_access_alerts");
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
  placeIds: string[],
): Promise<{ places_and_screens: ExistingScreens; version_id: string }> => {
  const response = await fetch(
    `/config/existing-screens/${appId}?place_ids=${placeIds.join(",")}`,
  );

  return await response.json();
};

export interface PendingAndLiveScreensResponse {
  places_and_screens: PendingAndLiveScreens;
  etag: string;
  version_id: string;
  last_modified_ms: number | null;
}

// Very similar to the `ExistingScreens` interface, except:
// 1. key is a string that combines place and app ID, and
// 2. place and app IDs are added to each `ExistingScreensAtPlace` object, so that we don't have to parse them from the combined string.
export interface PendingAndLiveScreens {
  [placeAndAppID: string]: ExistingScreensAtPlace & {
    place_id: string;
    app_id: string;
  };
}

export const fetchExistingScreensAtPlacesWithPendingScreens =
  async (): Promise<PendingAndLiveScreensResponse> => {
    const response = await fetch(
      "/config/existing-screens-at-places-with-pending-screens",
    );
    const etag = response.headers.get("etag") as string;
    const data = (await response.json()) as Omit<
      PendingAndLiveScreensResponse,
      "etag"
    >;

    return { ...data, etag };
  };

export const putPendingScreens = async (
  placesAndScreens: PlaceIdsAndNewScreens,
  screenType: "gl_eink_v2" | null,
  version_id: string,
): Promise<Response> => {
  return await fetch("/config/put", {
    ...getPostBodyAndHeaders({
      places_and_screens: placesAndScreens,
      screen_type: screenType,
      version_id: version_id,
    }),
    credentials: "include",
  });
};

interface PublishScreensForPlaceResponse {
  message: string;
  new_config?: Place[];
}

export const publishScreensForPlace = async (
  placeId: string,
  appId: string,
  hiddenFromScreenplayIds: string[],
  etag: string,
): Promise<{ status: number; message: string; newConfig: Place[] }> => {
  const bodyData = {
    hidden_from_screenplay_ids: hiddenFromScreenplayIds,
  };
  const response = await fetch(`/config/publish/${placeId}/${appId}`, {
    ...getPostBodyAndHeaders(bodyData, { "if-match": etag }),
    credentials: "include",
  });

  const json: PublishScreensForPlaceResponse = await response.json();

  return {
    status: response.status,
    message: json.message,
    newConfig: json.new_config ?? [],
  };
};

export const createNewPaMessage = async (
  message: NewPaMessageBody,
): Promise<{ status: number; errors: any }> => {
  const response = await fetch("/api/pa-messages", {
    ...getPostBodyAndHeaders(message),
    credentials: "include",
  });

  return {
    status: response.status,
    errors: JSON.parse(await response.text()).errors,
  };
};

export const updateExistingPaMessage = async (
  id: string | number,
  updates: UpdatePaMessageBody,
): Promise<{ status: number; body: any }> => {
  const response = await fetch(`/api/pa-messages/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "content-type": "application/json",
      "x-csrf-token": getCsrfToken(),
    },
    body: JSON.stringify(updates),
  });

  if (response.status === 422) {
    const body = await response.json();
    const error = Object.keys(body.errors);

    throw error;
  } else if (!response.ok) {
    const error = new Error(`Error: ${response.status} ${response.statusText}`);

    throw error;
  }

  return {
    status: response.status,
    body: await response.json(),
  };
};

const fetchOk = async (
  url: string,
  options: Omit<RequestInit, "body"> & { body: any },
) => {
  const res = await fetch(
    url,
    fp.merge(options, {
      body: JSON.stringify(options.body),
      credentials: "include" as RequestCredentials,
      headers: {
        "content-type": "application/json",
        "x-csrf-token": getCsrfToken(),
      },
    }),
  );
  if (!res.ok) {
    throw res;
  }
  return res.json();
};

export const getSuppressedPredictions = async () => {
  const res = await fetch("/api/suppressed-predictions");
  if (!res.ok) {
    throw res;
  }
  return res.json();
};

export const createSuppressedPrediction = (data: SuppressedPrediction) => {
  return fetchOk("/api/suppressed-predictions", { body: data, method: "POST" });
};

export const deleteSuppressedPrediction = (data: SuppressedPrediction) => {
  return fetchOk("/api/suppressed-predictions", {
    body: data,
    method: "DELETE",
  });
};

export const updateSuppressedPrediction = (data: SuppressedPrediction) => {
  return fetchOk("/api/suppressed-predictions", { body: data, method: "PUT" });
};

const getPostBodyAndHeaders = (
  bodyData: { [key: string]: any },
  extraHeaders: { [key: string]: string } = {},
) => {
  return {
    method: "POST",
    body: JSON.stringify(bodyData),
    headers: {
      ...extraHeaders,
      "content-type": "application/json",
      "x-csrf-token": getCsrfToken(),
    },
  };
};
