import React, { useEffect, useState } from "react";
import { Alert } from "../../models/alert";
import AlertCard from "./AlertCard";

const PostedAlerts = (): JSX.Element => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  useEffect(() => {
    fetch("/api/alerts")
      .then((response) => response.json())
      .then((alertsList: []) => {
        setAlerts(alertsList);
      });
  }, []);

  return (
    <div>
      {alerts.map((alert) => (
        <AlertCard key={alert.id} alert={alert} />
      ))}
    </div>
  );
};

export default PostedAlerts;
