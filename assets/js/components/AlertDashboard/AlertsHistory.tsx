import React, { useState, useEffect } from "react";
import AlertHistoryDetail from "./AlertHistoryDetail";

interface AlertsHistoryProps {}

const AlertsHistory = (props: AlertsHistoryProps): JSX.Element => {
  const [alertsData, setAlertsData] = useState([]);
  const [lastChangeTime, setLastChangeTime] = useState(Date.now());

  useEffect(() => {
    fetch("/api/list")
      .then((response) => response.json())
      .then(setAlertsData);
  }, [lastChangeTime]);

  return (
    <>
      <h2 className="text-30 alerts-list-header">Past Takeover Alerts</h2>
      {alertsData.map(AlertHistoryDetail)}
    </>
  );
};

export default AlertsHistory;
