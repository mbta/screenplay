import fp from "lodash/fp";
import { Alert } from "../models/alert";
import { Place } from "../models/place";
import { ScreensByAlert } from "../models/screensByAlert";
import getCsrfToken from "../csrf";
import type { PaMessageChange } from "Models/pa_message";
import { SuppressedPrediction } from "Models/suppressed_prediction";
import { withErrorHandling } from "./errorHandler";
import { REFRESH_PAGE_ERROR_MESSAGE } from "Constants/constants";

const API_ENDPOINT_PREDICTION_SUPPRESSION = "/api/suppressed-predictions";
const API_ENDPOINT_PA_MESSAGES = "/api/pa-messages";

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
  if (!response.ok) {
    throw response;
  }
  const { data } = await response.json();
  return data;
};

export const fetchPlaces = withErrorHandling(_fetchPlaces, {
  customMessage: `Failed to load places data. ${REFRESH_PAGE_ERROR_MESSAGE}`,
});

export const fetchLineStops = withErrorHandling(_fetchLineStops, {
  customMessage: `Failed to load line stops data. ${REFRESH_PAGE_ERROR_MESSAGE}`,
});

///////////
// Alerts
///////////
interface AlertsResponse {
  all_alert_ids: string[];
  alerts: Alert[];
  screens_by_alert: ScreensByAlert;
}

const _fetchAlerts = async (): Promise<AlertsResponse> => {
  const response = await fetch("/api/alerts");
  if (response.status === 200) {
    return response.json();
  } else {
    throw response;
  }
};

const _fetchActiveAndFutureAlerts =
  async (): Promise<AlertsResponse> => {
    const response = await fetch("/api/alerts/non_access_alerts");
    if (!response.ok) {
      throw response;
    }
    return response.json();
  };

export const fetchActiveAndFutureAlerts = withErrorHandling(
  _fetchActiveAndFutureAlerts,
  {
    customMessage: `Failed to load active alerts. ${REFRESH_PAGE_ERROR_MESSAGE}`,
  },
);

export const fetchAlerts = withErrorHandling(_fetchAlerts, {
  customMessage: `Failed to load alerts. ${REFRESH_PAGE_ERROR_MESSAGE}`,
});

///////////////
// PA Messages
///////////////

export const createNewPaMessage = async (
  message: PaMessageChange,
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
  change: PaMessageChange,
): Promise<{ status: number; body: any }> => {
  const response = await fetch(`${API_ENDPOINT_PA_MESSAGES}/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "content-type": "application/json",
      "x-csrf-token": getCsrfToken(),
    },
    body: JSON.stringify(change),
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

/////////////////////////
// Suppressed Predictions
/////////////////////////

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

export const getSuppressedPredictions = withErrorHandling(
  _getSuppressedPredictions,
  {
    customMessage: `Failed to load suppressed predictions. ${REFRESH_PAGE_ERROR_MESSAGE}`,
  },
);

export const createSuppressedPrediction = withErrorHandling(
  (data: SuppressedPrediction) =>
    fetchOk(API_ENDPOINT_PREDICTION_SUPPRESSION, {
      body: data,
      method: "POST",
    }),
  {
    customMessage: `Failed to create a prediction supression. ${REFRESH_PAGE_ERROR_MESSAGE}`,
  },
);

export const deleteSuppressedPrediction = withErrorHandling(
  (data: SuppressedPrediction) =>
    fetchOk(API_ENDPOINT_PREDICTION_SUPPRESSION, {
      body: data,
      method: "DELETE",
    }),
  {
    customMessage: `Failed to delete the prediction supression. ${REFRESH_PAGE_ERROR_MESSAGE}`,
  },
);

export const updateSuppressedPrediction = withErrorHandling(
  (data: SuppressedPrediction) =>
    fetchOk(API_ENDPOINT_PREDICTION_SUPPRESSION, { body: data, method: "PUT" }),
  {
    customMessage: `Failed to update theprediction supression. ${REFRESH_PAGE_ERROR_MESSAGE}`,
  },
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
