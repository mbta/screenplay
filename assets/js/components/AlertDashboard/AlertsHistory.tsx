import React, { useState, useEffect } from "react";
import AlertHistoryDetail from "./AlertHistoryDetail";

interface AlertsHistoryProps {
  lastChangeTime: number;
}

const AlertsHistory = ({ lastChangeTime }: AlertsHistoryProps): JSX.Element => {
  const [alertsData, setAlertsData] = useState([]);

  useEffect(() => {
    fetch("/api/list_cleared")
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
