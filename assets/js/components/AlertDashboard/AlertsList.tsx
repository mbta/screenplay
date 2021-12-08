import React, { useState, useEffect } from "react";
import AlertDetails from "./AlertDetails";
import { AlertData } from "../App";
import { ModalDetails } from "../ConfirmationModal";
import { BanIcon } from "@heroicons/react/solid";

interface AlertsListProps {
  startEditWizard: (data: AlertData) => void;
  triggerConfirmation: (modalDetails: ModalDetails) => void;
  closeModal: () => void;
}

const AlertsList = (props: AlertsListProps): JSX.Element => {
  const [alertsData, setAlertsData] = useState([]);
  const [lastChangeTime, setLastChangeTime] = useState(Date.now());

  useEffect(() => {
    fetch("/api/list")
      .then((response) => response.json())
      .then(setAlertsData);
  }, [lastChangeTime]);

  useEffect(() => {
    setTimeout(() => setLastChangeTime(Date.now()), 60000);
  }, [lastChangeTime]);

  const clearAlert = (
    id: string,
    setLastChangeTime: (time: number) => void
  ) => {
    const csrfMetaElement = document.head.querySelector(
      "[name~=csrf-token][content]"
    ) as HTMLMetaElement;
    const csrfToken = csrfMetaElement.content;
    const data = { id };

    fetch("/api/clear", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrfToken,
      },
      credentials: "include",
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }

        return response.json();
      })
      .then(({ success }) => {
        if (success) {
          setLastChangeTime(Date.now());
        } else {
          // Should this be a toast or other user-visible message?
          console.log("Error when clearing with id: ", id);
        }
      })
      .catch((error) => {
        // Should this be a toast or other user-visible message?
        console.log("Failed to clear alert: ", error);
      });

    props.closeModal();
  };

  const clearAllAlerts = () => {
    const csrfMetaElement = document.head.querySelector(
      "[name~=csrf-token][content]"
    ) as HTMLMetaElement;
    const csrfToken = csrfMetaElement.content;

    fetch("/api/clear_all", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrfToken,
      },
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }

        return response.json();
      })
      .then(({ success }) => {
        if (success) {
          setLastChangeTime(Date.now());
        } else {
          // Should this be a toast or other user-visible message?
          console.log("Error when clearing all alerts");
        }
      })
      .catch((error) => {
        // Should this be a toast or other user-visible message?
        console.log("Failed to clear all alerts: ", error);
      });

    props.closeModal();
  };

  const clearAllModalDetails: ModalDetails = {
    icon: <BanIcon className="icon" />,
    header: "Clear all Alerts",
    description:
      "This stops all Outfront Media screen Takeovers, and returns to the regularly scheduled content loop.",
    cancelText: "Keep Alerts",
    confirmJSX: (
      <>
        <BanIcon className="button-icon" />
        Clear all Alerts
      </>
    ),
    onSubmit: () => clearAllAlerts(),
  };

  return (
    <>
      {alertsData.length > 0 ? (
        <>
          <div className="text-30 alerts-list-header">
            <span>Live Takeover Alerts</span>
            {alertsData.length > 1 && (
              <button
                className="clear-all-alerts-button"
                onClick={() => props.triggerConfirmation(clearAllModalDetails)}
              >
                <BanIcon className="button-icon" />
                <span className="text-16">Clear all</span>
              </button>
            )}
          </div>

          {alertsData.map((data) => {
            const { id } = data;
            return (
              <AlertDetails
                data={data}
                setLastChangeTime={setLastChangeTime}
                startEditWizard={props.startEditWizard}
                clearAlert={clearAlert}
                triggerConfirmation={props.triggerConfirmation}
                key={id}
              />
            );
          })}
        </>
      ) : (
        <div className="dot-grid" />
      )}
    </>
  );
};

export default AlertsList;
