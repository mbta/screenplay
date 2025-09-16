import fp from "lodash/fp";
import { Alert } from "../models/alert";
import { Place } from "../models/place";
import { ScreenConfiguration } from "../models/screen_configuration";
import { ScreensByAlert } from "../models/screensByAlert";
import { PlaceIdsAndNewScreens } from "../components/Dashboard/PermanentConfiguration/Workflows/GlEink/ConfigureScreensPage";
import getCsrfToken from "../csrf";
import { NewPaMessageBody, UpdatePaMessageBody } from "Models/pa_message";
import { SuppressedPrediction } from "Models/suppressed_prediction";
import { withErrorHandlingDisplayError } from "./errorHandler";

const API_ENDPOINT_PREDICTION_SUPPRESSION = "/api/suppressed-predictions";
const API_ENDPOINT_PA_MESSAGES = "/api/pa-messages";

const REFRESH_PAGE_ERROR_MESSAGE =
  "Please refresh the page and contact engineering if the issue persists.";

/////////////////////
// Location Fetching
////////////////////
const _fetchPlaces = async (): Promise<Place[]> => {
  const response = await fetch("/api/dashboard");
  if (!response.ok) {
    throw response;
  }
  return response.json();
};

const _fetchLineStops = async () => {
  const response = await fetch("/api/line_stops");
  if (response.ok) {
    throw response;
  }
  const { data } = await response.json();
  return data;
};

export const fetchPlaces = withErrorHandlingDisplayError(
  _fetchPlaces,
  `Failed to load places data. ${REFRESH_PAGE_ERROR_MESSAGE}`,
);

export const fetchLineStops = withErrorHandlingDisplayError(
  _fetchLineStops,
  `Failed to load line stops data. ${REFRESH_PAGE_ERROR_MESSAGE}`,
);

///////////
// Alerts
///////////
interface AlertsResponse {
  all_alert_ids: string[];
  alerts: Alert[];
  screens_by_alert: ScreensByAlert;
}

export const _fetchAlerts = async (): Promise<AlertsResponse> => {
  const response = await fetch("/api/alerts");
  if (response.status === 200) {
    return response.json();
  } else {
    throw response;
  }
};

export const _fetchActiveAndFutureAlerts =
  async (): Promise<AlertsResponse> => {
    const response = await fetch("/api/alerts/non_access_alerts");
    return response.json();
  };

export const fetchActiveAndFutureAlerts = withErrorHandlingDisplayError(
  _fetchActiveAndFutureAlerts,
  `Failed to load active alerts. ${REFRESH_PAGE_ERROR_MESSAGE}`,
);

export const fetchAlerts = withErrorHandlingDisplayError(
  _fetchAlerts,
  `Failed to load alerts. ${REFRESH_PAGE_ERROR_MESSAGE}`,
);

///////////
// Screens
///////////
export interface ExistingScreens {
  [place_id: string]: ExistingScreensAtPlace;
}

export interface ExistingScreensAtPlace {
  live_screens?: { [screen_id: string]: ScreenConfiguration };
  pending_screens: { [screen_id: string]: ScreenConfiguration };
}

const _fetchExistingScreens = async (
  appId: string,
  placeIds: string[],
): Promise<{ places_and_screens: ExistingScreens; version_id: string }> => {
  const response = await fetch(
    `/config/existing-screens/${appId}?place_ids=${placeIds.join(",")}`,
  );

  if (!response.ok) {
    throw response;
  }

  return response.json();
};

export const fetchExistingScreens = withErrorHandlingDisplayError(
  _fetchExistingScreens,
  `Failed to load existing screens. ${REFRESH_PAGE_ERROR_MESSAGE}`,
);
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

const _fetchExistingScreensAtPlacesWithPendingScreens =
  async (): Promise<PendingAndLiveScreensResponse> => {
    const response = await fetch(
      "/config/existing-screens-at-places-with-pending-screens",
    );
    if (!response.ok) {
      throw response;
    }
    const etag = response.headers.get("etag") as string;
    const data = (await response.json()) as Omit<
      PendingAndLiveScreensResponse,
      "etag"
    >;
    return { ...data, etag };
  };

export const fetchExistingScreensAtPlacesWithPendingScreens =
  withErrorHandlingDisplayError(
    _fetchExistingScreensAtPlacesWithPendingScreens,
    `Failed to load pending screens data. ${REFRESH_PAGE_ERROR_MESSAGE}`,
  );

export const putPendingScreens = async (
  placesAndScreens: PlaceIdsAndNewScreens,
  screenType: "gl_eink_v2" | null,
  version_id: string,
): Promise<Response> => {
  return fetch("/config/put", {
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
  const response = await fetch(API_ENDPOINT_PA_MESSAGES, {
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
  const response = await fetch(`${API_ENDPOINT_PA_MESSAGES}${id}`, {
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

const _getSuppressedPredictions = async () => {
  const res = await fetch(API_ENDPOINT_PREDICTION_SUPPRESSION);
  if (!res.ok) {
    throw res;
  }
  return res.json();
};

export const getSuppressedPredictions = withErrorHandlingDisplayError(
  _getSuppressedPredictions,
  `Failed to load suppressed predictions. ${REFRESH_PAGE_ERROR_MESSAGE}`,
);

export const createSuppressedPrediction = withErrorHandlingDisplayError(
  (data: SuppressedPrediction) =>
    fetchOk(API_ENDPOINT_PREDICTION_SUPPRESSION, {
      body: data,
      method: "POST",
    }),
  `Failed to create a prediction supression. ${REFRESH_PAGE_ERROR_MESSAGE}`,
);

export const deleteSuppressedPrediction = withErrorHandlingDisplayError(
  (data: SuppressedPrediction) =>
    fetchOk(API_ENDPOINT_PREDICTION_SUPPRESSION, {
      body: data,
      method: "DELETE",
    }),
  `Failed to delete the prediction supression. ${REFRESH_PAGE_ERROR_MESSAGE}`,
);

export const updateSuppressedPrediction = withErrorHandlingDisplayError(
  (data: SuppressedPrediction) =>
    fetchOk(API_ENDPOINT_PREDICTION_SUPPRESSION, { body: data, method: "PUT" }),
  `Failed to update theprediction supression. ${REFRESH_PAGE_ERROR_MESSAGE}`,
);

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
