import React, { useState, useEffect } from "react";
import AlertDetails from "./AlertDetails";
import { AlertData } from "../App";

interface AlertsListProps {
  startEditWizard: (data: AlertData) => void;
}

const AlertsList = (props: AlertsListProps): JSX.Element => {
  const [alertsData, setAlertsData] = useState([]);
  const [lastChangeTime, setLastChangeTime] = useState(Date.now());

  useEffect(() => {
    fetch("/api/list")
      .then((response) => response.json())
      .then(setAlertsData);
  }, [lastChangeTime]);

  return (
    <div style={{ color: "white" }}>
      <div>Live Takeover Alerts</div>
      <table>
        <tbody>
          {alertsData.map((data) => {
            const { id } = data;
            return (
              <AlertDetails
                data={data}
                setLastChangeTime={setLastChangeTime}
                startEditWizard={props.startEditWizard}
                key={id}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AlertsList;
