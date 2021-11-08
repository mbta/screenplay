import React, { useState, useEffect } from "react";
import AlertDetails from "./AlertDetails";
import { AlertData } from "../App";
import { ModalDetails } from "../ConfirmationModal";

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

  return (
    <>
      {alertsData.length > 0 ? (
        <>
          <div className="text-30 alerts-list-header">Live Takeover Alerts</div>
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
