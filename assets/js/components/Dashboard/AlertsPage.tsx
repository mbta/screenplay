import React, { ComponentType, useEffect, useState } from "react";
import classNames from "classnames";
import { Alert } from "../../models/alert";
import AlertCard from "./AlertCard";

interface Props {
  isVisible: boolean;
}

const AlertsPage: ComponentType<Props> = (props: Props) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  useEffect(() => {
    if (!props.isVisible) return;

    fetch("/api/alerts")
      .then((response) => response.json())
      .then((alertsList: []) => {
        setAlerts(alertsList);
      });
  }, [props.isVisible]);

  return (
    <div
      className={classNames("alerts-page", {
        "alerts-page--hidden": !props.isVisible,
      })}
    >
      <div className="page-content__header">Posted Alerts</div>
      <div className="page-content__body">
        {alerts.map((alert) => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
      </div>
    </div>
  );
};

export default AlertsPage;
