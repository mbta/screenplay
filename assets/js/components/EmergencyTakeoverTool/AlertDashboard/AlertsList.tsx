import React, { ComponentType, useState, useEffect } from "react";
import AlertDetails from "./AlertDetails";
import { AlertData } from "../EmergencyTakeoverTool";
import { ModalDetails } from "../ConfirmationModal";
import { NoSymbolIcon } from "@heroicons/react/20/solid";
import { PastAlertsList } from "./PastAlertsList";
import ReactTooltip from "react-tooltip";
import { BASE_URL } from "Constants/constants";
import { withErrorHandling } from "Utils/errorHandler";

interface AlertsListProps {
  startEditWizard: (data: AlertData, step: number) => void;
  triggerConfirmation: (modalDetails: ModalDetails) => void;
  closeModal: () => void;
}

// const fetchActiveAlerts = withErrorHandling(
//   async () => {
//     const response = await fetch(`${BASE_URL}/active_alerts`);
//     if (!response.ok) {
//       throw response;
//     }
//     return response.json();
//   },
//   {
//     customMessage: "Failed to load active alerts. Please refresh the page.",
//   },
// );

// const fetchPastAlerts = withErrorHandling(
//   async () => {
//     const response = await fetch(`${BASE_URL}/past_alerts`);
//     if (!response.ok) {
//       throw response;
//     }
//     return response.json();
//   },
//   { customMessage: "Failed to load past alerts. Please refresh the page." },
// );

const fetchAllAlerts = withErrorHandling(
  async () => {
    const response = await fetch(`${BASE_URL}/active_and_past_alerts`);
    if (!response.ok) {
      throw response;
    }
    return response.json();
  },
  { customMessage: "Failed to load current and past alerts. Please refresh the page." },
);

const handleClearAlert = withErrorHandling(
  async (id: string) => {
    const csrfMetaElement = document.head.querySelector(
      "[name~=csrf-token][content]",
    ) as HTMLMetaElement;
    const csrfToken = csrfMetaElement.content;
    const data = { id };

    const response = await fetch(`${BASE_URL}/clear`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrfToken,
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || response.statusText);
    }

    return response.json();
  },
  { customMessage: "Failed to clear alert." },
);

const handleClearAllAlerts = withErrorHandling(
  async () => {
    const csrfMetaElement = document.head.querySelector(
      "[name~=csrf-token][content]",
    ) as HTMLMetaElement;
    const csrfToken = csrfMetaElement.content;

    const response = await fetch(`${BASE_URL}/clear_all`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrfToken,
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || response.statusText);
    }

    return response.json();
  },
  { customMessage: "Failed to clear all alerts." },
);

const AlertsList: ComponentType<AlertsListProps> = (props: AlertsListProps) => {
  const [alertsData, setAlertsData] = useState([]);
  const [pastAlertsData, setPastAlertsData] = useState([]);

  const refreshAlerts = async () => {
    // Refresh active and past alerts on page load, alert clear, and at a regular interval.
    const alertData = await fetchAllAlerts();
    // TODO: Maybe need to check both here
    if (alertData) {
      setAlertsData(alertData.current);
      setPastAlertsData(alertData.past);
    }
  };

  useEffect(() => {
    refreshAlerts();
    const interval = setInterval(refreshAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  const clearAlert = async (id: string) => {
    const result = await handleClearAlert(id);
    if (result?.success) {
      refreshAlerts();
    }
    props.closeModal();
  };

  const clearAllAlerts = async () => {
    const result = await handleClearAllAlerts();
    if (result?.success) {
      refreshAlerts();
    }
    props.closeModal();
  };

  const clearAllModalDetails: ModalDetails = {
    icon: <NoSymbolIcon className="icon" />,
    header: "Clear all Alerts",
    description:
      "This stops all Emergency Takeovers and returns to regularly scheduled content.",
    cancelText: "Keep Alerts",
    confirmJSX: (
      <>
        <NoSymbolIcon className="button-icon" />
        Clear all Alerts
      </>
    ),
    onSubmit: () => clearAllAlerts(),
  };

  return (
    <>
      {alertsData.length > 0 && (
        <>
          <div className="text-30 alerts-list-header">
            <span>Live Takeover Alerts</span>
            {alertsData.length > 1 && (
              <button
                className="clear-all-alerts-button"
                onClick={() => props.triggerConfirmation(clearAllModalDetails)}
              >
                <NoSymbolIcon className="button-icon" />
                <span className="text-16">Clear all</span>
              </button>
            )}
            <ReactTooltip />
          </div>

          {alertsData.map((data) => {
            const { id } = data;
            return (
              <AlertDetails
                data={data}
                startEditWizard={props.startEditWizard}
                clearAlert={clearAlert}
                triggerConfirmation={props.triggerConfirmation}
                key={id}
              />
            );
          })}
          {pastAlertsData.length > 0 && <hr className="solid-separator" />}
        </>
      )}
      {pastAlertsData.length > 0 && (
        <PastAlertsList pastAlertsData={pastAlertsData} />
      )}
      {alertsData.length + pastAlertsData.length === 0 && (
        <div className="dot-grid" />
      )}
    </>
  );
};

export default AlertsList;
